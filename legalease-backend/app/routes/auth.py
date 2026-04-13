from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from app.models.user import UserRegister, UserLogin, UserForgotPassword, UserResetPassword
from app.database import get_db
from app.utils.auth_utils import hash_password, verify_password, create_token, get_current_user_id, create_reset_token, decode_token
from app.services.email_svc import send_reset_email
import time

router = APIRouter()

# Simple In-Memory Cache representing: { user_id: { "data": dict, "expires_at": float } }
USER_CACHE = {}
CACHE_TTL = 300  # 5 minutes


@router.post("/register")
async def register(data: UserRegister):
    db = await get_db()
    try:
        # Check if email already exists
        cursor = await db.execute("SELECT id FROM users WHERE email = ?", (data.email,))
        existing = await cursor.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered. Please login.")

        # Hash password and store user
        hashed = hash_password(data.password)
        cursor = await db.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (data.name, data.email, hashed),
        )
        await db.commit()
        user_id = cursor.lastrowid

        # Create JWT token
        token = create_token({"userId": str(user_id)})

        return {
            "message": "Account created successfully!",
            "token": token,
            "user": {"id": str(user_id), "name": data.name, "email": data.email},
        }
    finally:
        await db.close()


@router.post("/login")
async def login(data: UserLogin):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id, name, email, password FROM users WHERE email = ?", (data.email,))
        user = await cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="No account found with this email.")

        if not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Incorrect password.")

        token = create_token({"userId": str(user["id"])})
        user_id_str = str(user["id"])
        
        # Construct response data
        user_data = {"id": user_id_str, "name": user["name"], "email": user["email"]}
        
        # Prime the cache while logging in
        USER_CACHE[user_id_str] = {
            "data": user_data,
            "expires_at": time.time() + CACHE_TTL
        }

        return {
            "message": "Login successful!",
            "token": token,
            "user": user_data,
        }
    finally:
        await db.close()


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user_id)):
    now = time.time()
    
    # Fast path: Check Cache
    if user_id in USER_CACHE and USER_CACHE[user_id]["expires_at"] > now:
        return USER_CACHE[user_id]["data"]

    db = await get_db()
    try:
        cursor = await db.execute("SELECT id, name, email FROM users WHERE id = ?", (int(user_id),))
        user = await cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        result = {"id": str(user["id"]), "name": user["name"], "email": user["email"]}
        
        # Populate Cache
        USER_CACHE[user_id] = {
            "data": result,
            "expires_at": now + CACHE_TTL
        }
        return result
    finally:
        await db.close()

@router.delete("/me")
async def delete_me(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    try:
        # Delete user's documents first (foreign key constraint/cleanup)
        await db.execute("DELETE FROM documents WHERE userId = ?", (int(user_id),))
        
        # Delete the user
        cursor = await db.execute("DELETE FROM users WHERE id = ?", (int(user_id),))
        await db.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        return {"message": "Account deleted successfully."}
    finally:
        await db.close()

@router.post("/forgot-password")
async def forgot_password(data: UserForgotPassword, background_tasks: BackgroundTasks):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM users WHERE email = ?", (data.email,))
        user = await cursor.fetchone()
        
        # Even if the user doesn't exist, we return a success message for security.
        if user:
            reset_token = create_reset_token(data.email)
            background_tasks.add_task(send_reset_email, data.email, reset_token)
        
        # We no longer expose the demo link in the response JSON to the frontend!
        return {"message": "If the email is registered, a reset link has been sent."}
    finally:
        await db.close()

@router.post("/reset-password")
async def reset_password(data: UserResetPassword):
    try:
        payload = decode_token(data.token)
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type.")
        email = payload.get("email")
    except Exception:
        raise HTTPException(status_code=400, detail="The reset link is invalid or has expired.")

    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = await cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User associated with this token not found.")
            
        hashed = hash_password(data.new_password)
        await db.execute("UPDATE users SET password = ? WHERE email = ?", (hashed, email))
        await db.commit()
        
        return {"message": "Password has been reset successfully. You can now login."}
    finally:
        await db.close()

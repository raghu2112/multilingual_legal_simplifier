import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from fastapi.responses import Response, StreamingResponse
from app.database import get_db
from app.utils.auth_utils import get_current_user_id
from app.services.file_extractor import extract_text_from_file
from app.services.encryption_svc import encrypt_file, decrypt_file
from app.services.ai_summarizer import analyze_document, chat_with_document
from app.services.nlp_retriever import retrieve_relevant_context
from datetime import datetime

router = APIRouter()

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

SUPPORTED_LANGUAGES = [
    "English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam",
    "Bengali", "Marathi", "Gujarati", "Punjabi", "Urdu",
    "French", "Spanish", "German", "Portuguese",
    "Chinese", "Japanese", "Korean", "Arabic", "Russian",
]


@router.get("/languages")
async def get_languages():
    """Return the list of supported output languages."""
    return {"languages": SUPPORTED_LANGUAGES}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    language: str = Form("English"),
    user_id: str = Depends(get_current_user_id),
):
    # Validate language
    if language not in SUPPORTED_LANGUAGES:
        language = "English"

    # Validate file type
    permitted = ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpg"]
    # We will log or rely on Python checks rather than strictly failing here
    
    # Read file
    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size must be under 10MB.")

    try:
        # Extract text from multi-format file
        text = extract_text_from_file(file_bytes, file.filename)
        if not text or len(text.strip()) < 50:
            raise HTTPException(
                status_code=422,
                detail="Could not extract readable text from this file. Ensure it has readable text content.",
            )

        # Encrypt original binary bytes and the text for caching
        encrypted_data = encrypt_file(file_bytes)
        encrypted_text = encrypt_file(text.encode('utf-8'))

        # Analyze with AI in the user-specified language
        analysis = analyze_document(text, output_language=language)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    # Save to SQLite
    now = datetime.utcnow().isoformat()
    risk_clauses_json = json.dumps(analysis.get("riskClauses", []))
    key_terms_json = json.dumps(analysis.get("keyTerms", []))

    db = await get_db()
    try:
        cursor = await db.execute(
            """INSERT INTO documents
               (userId, fileName, fileData, fileMimeType, extractedText, documentType, summary, riskClauses, keyTerms,
                detectedLanguage, outputLanguage, createdAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                int(user_id),
                file.filename,
                encrypted_data,
                file.content_type,
                encrypted_text,
                analysis.get("documentType", "other"),
                analysis.get("summary", ""),
                risk_clauses_json,
                key_terms_json,
                analysis.get("detectedLanguage", "Unknown"),
                language,
                now,
            ),
        )
        await db.commit()
        doc_id = cursor.lastrowid
    finally:
        await db.close()

    return {
        "id": str(doc_id),
        "fileName": file.filename,
        "documentType": analysis.get("documentType", "other"),
        "summary": analysis.get("summary", ""),
        "riskClauses": analysis.get("riskClauses", []),
        "keyTerms": analysis.get("keyTerms", []),
        "detectedLanguage": analysis.get("detectedLanguage", "Unknown"),
        "outputLanguage": language,
        "createdAt": now,
    }


@router.get("/history")
async def get_history(user_id: str = Depends(get_current_user_id)):
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT id, fileName, documentType, summary, outputLanguage, createdAt
               FROM documents WHERE userId = ? ORDER BY createdAt DESC""",
            (int(user_id),),
        )
        rows = await cursor.fetchall()

        docs = []
        for row in rows:
            summary = row["summary"] or ""
            docs.append({
                "id": str(row["id"]),
                "fileName": row["fileName"] or "",
                "documentType": row["documentType"] or "other",
                "summary": summary[:200] + "..." if len(summary) > 200 else summary,
                "outputLanguage": row["outputLanguage"] or "English",
                "createdAt": row["createdAt"] or "",
            })
        return {"documents": docs}
    finally:
        await db.close()


@router.get("/{doc_id}")
async def get_document(doc_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        doc_id_int = int(doc_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID.")

    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT id, fileName, documentType, summary, riskClauses, keyTerms,
                      detectedLanguage, outputLanguage, createdAt
               FROM documents WHERE id = ? AND userId = ?""",
            (doc_id_int, int(user_id)),
        )
        doc = await cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found.")

        return {
            "id": str(doc["id"]),
            "fileName": doc["fileName"] or "",
            "documentType": doc["documentType"] or "other",
            "summary": doc["summary"] or "",
            "riskClauses": json.loads(doc["riskClauses"] or "[]"),
            "keyTerms": json.loads(doc["keyTerms"] or "[]"),
            "detectedLanguage": doc["detectedLanguage"] or "Unknown",
            "outputLanguage": doc["outputLanguage"] or "English",
            "createdAt": doc["createdAt"] or "",
        }
    finally:
        await db.close()


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        doc_id_int = int(doc_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID.")

    db = await get_db()
    try:
        cursor = await db.execute(
            "DELETE FROM documents WHERE id = ? AND userId = ?",
            (doc_id_int, int(user_id)),
        )
        await db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Document not found.")

        return {"message": "Document deleted successfully."}
    finally:
        await db.close()

@router.get("/{doc_id}/download")
async def download_document(doc_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        doc_id_int = int(doc_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID.")

    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT fileName, fileData, fileMimeType FROM documents WHERE id = ? AND userId = ?",
            (doc_id_int, int(user_id)),
        )
        doc = await cursor.fetchone()
        if not doc or not doc["fileData"]:
            raise HTTPException(status_code=404, detail="File not found or unretrievable.")
            
        decrypted_bytes = decrypt_file(doc["fileData"])
        
        return Response(
            content=decrypted_bytes,
            media_type=doc["fileMimeType"] or "application/octet-stream",
            headers={"Content-Disposition": f'attachment; filename="{doc["fileName"]}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
    finally:
        await db.close()

@router.post("/{doc_id}/chat")
async def chat_document(doc_id: str, request: Request, user_id: str = Depends(get_current_user_id)):
    """Stream an AI chat response based on the document's text."""
    try:
        doc_id_int = int(doc_id)
        body = await request.json()
        messages = body.get("messages", [])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request payload.")

    if not messages:
        raise HTTPException(status_code=400, detail="Messages array cannot be empty.")

    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT extractedText FROM documents WHERE id = ? AND userId = ?",
            (doc_id_int, int(user_id)),
        )
        doc = await cursor.fetchone()
        
        if not doc or not doc["extractedText"]:
            raise HTTPException(status_code=404, detail="Document text not found or unavailable for chat.")
            
        # Decrypt full document text
        try:
            full_document_text = decrypt_file(doc["extractedText"]).decode('utf-8')
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to decrypt document text context.")

        # Extract the user's most recent question
        user_query = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_query = msg.get("content", "")
                break

        # Apply BM25 Lexical NLP RAG
        optimal_context = retrieve_relevant_context(full_document_text, user_query)

        # Stream AI response using the mathematically filtered context
        return StreamingResponse(
            chat_with_document(optimal_context, messages),
            media_type="text/event-stream"
        )
    finally:
        await db.close()

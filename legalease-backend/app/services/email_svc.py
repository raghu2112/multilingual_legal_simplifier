import smtplib
from email.message import EmailMessage
from app.config import SMTP_EMAIL, SMTP_PASSWORD

def send_reset_email(to_email: str, reset_token: str):
    """
    Sends a secure HTML password reset email using native smtplib.
    Depends on valid SMTP_EMAIL and SMTP_PASSWORD in the .env file.
    Default connects via SMTP_SSL to smtp.gmail.com.
    """
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("Bypassing Email Reset: SMTP_EMAIL or SMTP_PASSWORD is not set in .env")
        return

    # In a full-stack real-world app, this would dynamically map to the VITE_FRONTEND_URL
    # For local testing, we hardcode the standard vite port:
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"

    msg = EmailMessage()
    msg['Subject'] = 'LegalEase - Reset Your Password'
    msg['From'] = f"LegalEase Support <{SMTP_EMAIL}>"
    msg['To'] = to_email

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #fdfbf7; padding: 40px; text-align: center; }}
            .container {{ max-w: 600px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 4px; }}
            .btn {{ display: inline-block; padding: 12px 24px; background-color: #002147; color: white; text-decoration: none; font-weight: bold; margin-top: 20px; border-radius: 2px; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; }}
            .footer {{ margin-top: 30px; font-size: 11px; color: #888; font-style: italic; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1 style="color: #002147; letter-spacing: -0.5px;">⚖️ LegalEase</h1>
            <h3>Password Reset Request</h3>
            <p>We received a request to reset the password for your LegalEase account. If you made this request, please click the secure link below to choose a new password.</p>
            
            <a href="{reset_link}" class="btn">Reset Password</a>
            
            <p style="margin-top: 25px; font-size: 14px;">This link will securely expire in exactly 15 minutes.</p>
            <p style="margin-top: 10px; font-size: 13px; color: #555;">If you did not request this, you can safely ignore this email.</p>
            
            <div class="footer">
                Automated message from LegalEase Security.
            </div>
        </div>
    </body>
    </html>
    """

    msg.set_content(f"Reset your password at: {reset_link}")
    msg.add_alternative(html_content, subtype='html')

    try:
        # Standard Gmail SMTP connection protocol. To use Outlook/Yahoo, switch the URL.
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(SMTP_EMAIL, SMTP_PASSWORD)
            smtp.send_message(msg)
        print(f"✅ Reset email successfully dispatched to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send reset email via SMTP: {str(e)}")

import io
import base64
import pdfplumber
import docx
from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extract text from various file formats."""
    ext = filename.lower().split('.')[-1]
    
    if ext == 'pdf':
        return _extract_from_pdf(file_bytes)
    elif ext in ['docx', 'doc']:
        return _extract_from_docx(file_bytes)
    elif ext in ['jpg', 'jpeg', 'png']:
        return _extract_from_image(file_bytes, ext)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Permitted formats: pdf, docx, jpg, png.")

def _extract_from_pdf(file_bytes: bytes) -> str:
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

def _extract_from_docx(file_bytes: bytes) -> str:
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from Word document: {str(e)}")

def _extract_from_image(file_bytes: bytes, ext: str) -> str:
    try:
        if ext == 'jpg': ext = 'jpeg'
        base64_image = base64.b64encode(file_bytes).decode('utf-8')
        
        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Please extract all text completely, accurately, and exactly from this image. Do not add any conversational text or summarization, just the raw text you see."},
                        {"type": "image_url", "image_url": {"url": f"data:image/{ext};base64,{base64_image}"}}
                    ]
                }
            ],
            temperature=0.1,
            max_tokens=2048
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from image using AI Vision: {str(e)}")

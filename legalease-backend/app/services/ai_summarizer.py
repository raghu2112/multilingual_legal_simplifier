import json
import re
from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """You are an expert legal document analyst who is fluent in ALL languages. Help ordinary people understand complex legal documents.

You will receive a legal document that may be written in ANY language (English, Hindi, Telugu, Tamil, French, Spanish, Chinese, Arabic, etc.).

Your task:
1. Auto-detect the language of the document.
2. Analyze the document thoroughly.
3. Produce ALL output text in the TARGET LANGUAGE specified by the user.

Respond with ONLY a valid JSON object. No markdown, no code fences, just raw JSON.

The JSON must have exactly these fields:
{
  "detectedLanguage": "The language the document is written in (e.g. English, Hindi, Telugu, French, etc.)",
  "summary": "A clear 3-5 sentence plain-language explanation of what this document is about and what the person is agreeing to. MUST be written in the TARGET LANGUAGE.",
  "documentType": "One of: rental | employment | nda | terms | loan | service | other",
  "riskClauses": [
    {
      "clause": "The risky clause from the document (translated to TARGET LANGUAGE if needed)",
      "explanation": "Plain-language explanation of why this is risky. MUST be written in the TARGET LANGUAGE.",
      "solution": "Actionable advice or a counter-proposal to mitigate this risk. MUST be written in the TARGET LANGUAGE.",
      "relatedSections": "The specific document sections, articles, or headers where this clause is located (e.g. 'Article 4', 'Section 2.1'). If none, output 'N/A'. MUST be in the TARGET LANGUAGE.",
      "severity": "high | medium | low"
    }
  ],
  "keyTerms": [
    {
      "term": "Term name e.g. Notice Period, Monthly Rent, Penalty (in TARGET LANGUAGE)",
      "value": "The value e.g. 30 days, Rs. 15000"
    }
  ]
}

Rules:
- Write for someone with NO legal knowledge
- ALL text output (summary, explanations, solutions, relatedSections, clause text, term names) MUST be in the TARGET LANGUAGE
- Find at least 3-5 risk clauses if they exist
- Must provide a highly actionable 'solution' and point out the 'relatedSections' for every single risk clause found
- Extract at least 3-5 key terms
- severity: high = very risky, medium = notable, low = minor
- detectedLanguage should always be in English (e.g. "Hindi" not "हिंदी")
- documentType values must always be in English (rental, employment, etc.)
- Return ONLY raw JSON, nothing else"""


def analyze_document(text: str, output_language: str = "English") -> dict:
    """Send extracted PDF text to Groq and return structured analysis in the specified language."""
    truncated_text = text[:12000]

    if not truncated_text.strip():
        raise ValueError("Document appears to be empty or unreadable.")

    user_message = (
        f"TARGET LANGUAGE for all output: {output_language}\n\n"
        f"Analyze this legal document:\n\n{truncated_text}"
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.2,
        max_tokens=4096,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content.strip()

    # Clean up any markdown fences just in case
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError("AI returned invalid JSON. Please try again.")

    result.setdefault("detectedLanguage", "Unknown")
    result.setdefault("summary", "Summary not available.")
    result.setdefault("documentType", "other")
    result.setdefault("riskClauses", [])
    result.setdefault("keyTerms", [])

    return result

def chat_with_document(document_text: str, chat_history: list):
    """
    Stream a response from the LLM based on user queries regarding the document.
    chat_history should be a list of dicts: [{"role": "user"|"assistant", "content": "..."}]
    """
    truncated_text = document_text[:15000] # Safe context fit
    
    sys_prompt = {"role": "system", "content": (
        "You are an expert, helpful legal assistant. You are answering questions based ONLY on the provided legal document text. "
        "Do not invent information outside of the text. If the answer is not in the text, politely say so. "
        "Keep your answers clear, concise, and easy to understand for an ordinary person without legal training. "
        "Answer in the same language the user uses to ask the question.\n\n"
        f"--- DOCUMENT TEXT ---\n{truncated_text}\n--- END OF DOCUMENT ---"
    )}
    
    messages = [sys_prompt] + chat_history
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.3,
        max_tokens=1024,
        stream=True
    )
    
    for chunk in response:
        content = chunk.choices[0].delta.content
        if content:
            yield content
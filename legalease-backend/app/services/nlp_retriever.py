import re
from rank_bm25 import BM25Okapi

def chunk_text(text: str, max_chunk_size=600):
    """
    Split the text into logical chunks roughly based on max_chunk_size.
    We respect sentence boundaries and double newlines.
    """
    # Split by recognizable sentence endings or linebreaks
    sentences = re.split(r'(?<=[.!?]) +|\n+', text)
    
    chunks = []
    current_chunk = []
    current_length = 0
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        sentence_len = len(sentence)
        if current_length + sentence_len > max_chunk_size and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_length = sentence_len
        else:
            current_chunk.append(sentence)
            current_length += sentence_len
            
    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return chunks

def tokenize_string(text: str):
    """Basic lexical tokenization stripping punctuation for BM25 accuracy."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text.split()

def retrieve_relevant_context(full_text: str, user_query: str, top_k: int = 5) -> str:
    """
    Use BM25 NLP to algorithmically fetch the most relevant document chunks
    from the full_text that structurally correlate to the user_query.
    """
    # 1. Chunk document
    chunks = chunk_text(full_text)
    
    if not chunks:
        return ""
        
    if len(chunks) <= top_k:
        # If the document is small, no need to search, return all
        return "\n\n".join(chunks)
        
    # 2. Tokenize mathematical corpus
    tokenized_corpus = [tokenize_string(chunk) for chunk in chunks]
    
    # 3. Initialize BM25 Model
    bm25 = BM25Okapi(tokenized_corpus)
    
    # 4. Score Lexical Query
    tokenized_query = tokenize_string(user_query)
    
    # 5. Extract top mathematically matching paragraphs
    top_chunks = bm25.get_top_n(tokenized_query, chunks, n=top_k)
    
    # Merge and format explicitly
    context = "\n[... Document Section ...]\n".join(top_chunks)
    return context

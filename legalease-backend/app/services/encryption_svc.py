from cryptography.fernet import Fernet
from app.config import FILE_ENCRYPTION_KEY

if not FILE_ENCRYPTION_KEY or len(FILE_ENCRYPTION_KEY) < 32:
    # Fallback key generation if not provided in .env correctly
    # Only for development, production should strictly use .env
    f_key = Fernet.generate_key()
else:
    f_key = FILE_ENCRYPTION_KEY.encode('utf-8')

fernet = Fernet(f_key)

def encrypt_file(file_bytes: bytes) -> bytes:
    """Encrypts raw file bytes symmetrically and returns encrypted bytes."""
    return fernet.encrypt(file_bytes)

def decrypt_file(encrypted_bytes: bytes) -> bytes:
    """Decrypts raw file bytes symmetrically and returns original bytes."""
    return fernet.decrypt(encrypted_bytes)

import aiosqlite
import os

DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "legalease.db")


async def get_db():
    """Get an async SQLite connection."""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db():
    """Create tables if they don't exist."""
    db = await aiosqlite.connect(DATABASE_PATH)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            fileName TEXT NOT NULL,
            fileUrl TEXT DEFAULT '',
            fileData BLOB,
            fileMimeType TEXT,
            extractedText BLOB,
            documentType TEXT DEFAULT 'other',
            summary TEXT DEFAULT '',
            riskClauses TEXT DEFAULT '[]',
            keyTerms TEXT DEFAULT '[]',
            detectedLanguage TEXT DEFAULT 'Unknown',
            outputLanguage TEXT DEFAULT 'English',
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    """)
    
    # Run migrations for existing DB
    try:
        await db.execute("ALTER TABLE documents ADD COLUMN fileData BLOB")
    except aiosqlite.OperationalError:
        pass
        
    try:
        await db.execute("ALTER TABLE documents ADD COLUMN fileMimeType TEXT")
    except aiosqlite.OperationalError:
        pass

    try:
        await db.execute("ALTER TABLE documents ADD COLUMN extractedText BLOB")
    except aiosqlite.OperationalError:
        pass

    await db.commit()
    await db.close()
    print(f"✅ SQLite database initialized at: {DATABASE_PATH}")

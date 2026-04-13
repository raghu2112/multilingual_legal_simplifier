# ⚖️ LegalEase — AI-Powered Legal Document Summarizer

> Upload any legal document and get an instant plain-English summary, risk analysis, and key terms — without needing a lawyer.

---

## 🚀 Live Demo

- **Frontend:** https://legalease.vercel.app (deploy your own)
- **Backend:** https://legalease-api.onrender.com (deploy your own)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, Tailwind CSS, React Router |
| Backend | Python, FastAPI, Uvicorn |
| Database | MongoDB Atlas (via Motor async driver) |
| AI | Groq API — Llama 3.3 70B (FREE) |
| PDF Processing | pdfplumber |
| File Storage | Cloudinary |
| Auth | JWT (JSON Web Tokens) + Bcrypt |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
legalease/
├── legalease-backend/         # FastAPI Python backend
│   ├── main.py                # App entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment variables template
│   └── app/
│       ├── config.py          # DB + env config
│       ├── models/            # Pydantic schemas
│       ├── routes/            # API route handlers
│       ├── services/          # Business logic (AI, PDF, Cloudinary)
│       └── utils/             # Auth helpers (JWT, bcrypt)
│
└── legalease-frontend/        # React Vite frontend
    ├── src/
    │   ├── App.jsx            # Root with routing
    │   ├── pages/             # All page components
    │   ├── components/        # Reusable UI components
    │   ├── context/           # Auth context
    │   ├── api/               # API call functions
    │   └── utils/             # Helper functions
    └── index.html
```

---

## ⚙️ Local Setup & Running

### Prerequisites
- Node.js v18+
- Python v3.10+
- MongoDB Atlas account (free)
- OpenAI API key
- Cloudinary account (free)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/legalease.git
cd legalease
```

---

### 2. Backend Setup

```bash
cd legalease-backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
MONGO_URL=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/legalease
SECRET_KEY=your_super_secret_key_at_least_32_chars_long
GEMINI_API_KEY=your_google_gemini_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> 🔑 **How to get your FREE Gemini API Key:**
> 1. Go to [aistudio.google.com](https://aistudio.google.com)
> 2. Sign in with your Google account
> 3. Click **"Get API Key"** → **"Create API Key"**
> 4. Copy the key and paste it as `GEMINI_API_KEY` in your `.env`
> 5. That's it! **Free tier gives you 1,500 requests/day — no credit card needed.**

Run the backend:

```bash
uvicorn main:app --reload --port 8000
```

Backend will be live at: http://localhost:8000  
API docs at: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
cd ../legalease-frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

Frontend will be live at: http://localhost:5173

---

## 🌐 Deployment

### Deploy Backend to Render (Free)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set these settings:
   - **Root Directory:** `legalease-backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env`
6. Deploy!

### Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set:
   - **Root Directory:** `legalease-frontend`
   - **Framework Preset:** Vite
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL
5. Deploy!

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create new account |
| POST | `/api/auth/login` | ❌ | Login, get JWT token |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/document/upload` | ✅ | Upload PDF & get AI analysis |
| GET | `/api/document/history` | ✅ | Get user's document history |
| GET | `/api/document/:id` | ✅ | Get single document analysis |
| DELETE | `/api/document/:id` | ✅ | Delete a document |

---

## ✨ Features

- ✅ Upload PDF legal documents (up to 10MB)
- ✅ AI-generated plain-English summary
- ✅ Risk clause detection (High / Medium / Low)
- ✅ Key terms extraction (dates, amounts, penalties)
- ✅ Document type auto-detection
- ✅ Document history with full analysis
- ✅ User authentication (register/login)
- ✅ Secure JWT-based sessions
- ✅ Fully responsive UI

---

## 🔐 Security Notes

- Passwords are hashed with bcrypt (never stored in plain text)
- All protected routes require a valid JWT token
- Documents are only accessible by the owner user
- Never commit your `.env` file to GitHub

---

## 👩‍💻 Built By

**Srilekha** — B.Tech Computer Science, 2026 Graduate  
Built as a portfolio project demonstrating Full Stack + AI development skills.

---

## ⚠️ Disclaimer

LegalEase is for informational purposes only. The AI summaries are not legal advice. Always consult a qualified lawyer before signing any legal document.

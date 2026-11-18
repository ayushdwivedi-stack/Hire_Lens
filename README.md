Hire_Lens

Hire_Lens is an AI-powered resume analysis platform that compares a candidate's resume with a job description and produces an evidence-based ATS-style analysis.

The project combines a Next.js frontend, FastAPI backend, PDF text extraction, and a configurable AI layer that supports local Ollama models as well as OpenAI-compatible analysis.

Current local development uses Ollama with qwen3:4b so the application can run without an OpenAI API key.

Features

Upload a resume in PDF format.

Extract resume text with PyMuPDF.

Paste a target job description.

Analyze resume-to-job alignment.

Generate an overall match score.

Break down the analysis by resume sections.

Identify matched keywords.

Identify missing critical and nice-to-have requirements.

Surface observable ATS-related issues.

Provide evidence-based quick wins and rewrite suggestions.

Validate AI output against a structured Pydantic response schema.

Support local AI inference through Ollama.

Keep AI credentials and local environment settings outside Git.

Tech Stack

Frontend

Next.js 16

React 19

TypeScript

Tailwind CSS

ESLint

Backend

Python

FastAPI

Pydantic

PyMuPDF

HTTPX

Ollama

Optional OpenAI API support

Project Structure

Hire_Lens/
├── backend/
│   ├── prompts/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── config.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── .env.local.example
├── .gitignore
├── PRD.md
└── README.md

How It Works

Resume PDF
    │
    ▼
Next.js Frontend
    │
    ▼
FastAPI API
    │
    ├── PyMuPDF
    │      └── Resume text extraction
    │
    ▼
AI Analysis Service
    │
    ├── Ollama / local Qwen model
    └── OpenAI (optional)
    │
    ▼
Structured AnalysisResult
    │
    ▼
Results Dashboard

Local Setup

1. Clone the repository

git clone https://github.com/sharmakanishka05/Hire_Lens.git
cd Hire_Lens

2. Backend setup

Create and activate a virtual environment:

python -m venv .venv
.\.venv\Scripts\Activate.ps1

Install backend dependencies:

pip install -r backend\requirements.txt

Create the local environment file:

Copy-Item backend\.env.example backend\.env

For local AI, configure:

AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b

Start Ollama and make sure the model is installed:

ollama serve
ollama pull qwen3:4b

Start the backend:

python -m uvicorn backend.main:app

The API runs at:

http://127.0.0.1:8000

Health check:

GET /api/health

3. Frontend setup

Open another terminal:

cd frontend
npm install

Create the local frontend environment file:

Copy-Item .env.local.example .env.local

Set:

NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

Start the frontend:

npm run dev

Open:

http://localhost:3000

API Endpoints

Health

GET /api/health

Parse PDF

POST /api/parse-pdf

Accepts a PDF and returns extracted text, page count, and character count.

Analyze PDF Resume

POST /api/analyze

Form fields:

resume_file

job_description

Analyze Plain Text

POST /api/analyze-text

Accepts:

{
  "resume_text": "Candidate resume text...",
  "job_description": "Target job description..."
}

AI Safety and Accuracy

Hire_Lens treats resume and job-description content as untrusted document data.

The analysis layer is designed to:

avoid treating document text as system instructions,

avoid inventing candidate experience,

distinguish supported evidence from missing evidence,

avoid presenting unsupported skills as exact matches,

avoid recommending fabricated internships, achievements, metrics, or certifications,

return structured JSON that is validated by the backend.

The scoring system also considers more than keyword overlap, including skills, experience, responsibilities, education, and resume evidence quality.

Environment Variables

Backend:

AI_PROVIDER=ollama

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
OPENAI_TIMEOUT_SECONDS=60

OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
OLLAMA_TIMEOUT_SECONDS=300

HOST=0.0.0.0
PORT=8000

CORS_ORIGINS=http://localhost:3000

MAX_RESUME_CHARS=15000
MAX_JD_CHARS=8000
MAX_PDF_BYTES=10485760

Frontend:

NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

Do not commit backend/.env or frontend/.env.local.

Development Checks

Backend:

python -m uvicorn backend.main:app

Frontend:

npm run lint
npm run typecheck
npm run build

Limitations

Text extraction currently depends on the PDF containing selectable text.

Scanned/image-only PDFs require OCR support, which is not currently part of the main pipeline.

Local Ollama inference depends on the machine having enough resources for the selected model.

Public deployment requires a hosted inference strategy rather than relying on a developer's local Ollama instance.

Roadmap

OCR support for scanned resumes.

Better deterministic keyword and requirement extraction.

Stronger scoring calibration with evaluation datasets.

Resume section-aware parsing.

Improved evidence tracing for recommendations.

Production deployment with hosted inference.

Automated tests for API validation and analysis quality.

Author

Kanishka Sharma

GitHub: https://github.com/sharmakanishka05
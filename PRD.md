# AI-Powered Resume & JD Matcher

## 1. Project Overview

### Vision

A full-stack web application that analyzes a user's resume (PDF or plain text) against a job description and returns an ATS compatibility score, keyword gap analysis, section-level feedback, and AI-generated rewrite suggestions — all powered by the OpenAI API.

### Core Value Proposition

Job seekers spend hours manually tailoring resumes for each role. ATS systems reject 75% of resumes before a human ever reads them. This tool automates the gap analysis, surfaces missing keywords, scores section quality, and suggests targeted rewrites — turning a generic resume into a role-specific one in under 30 seconds.

### Tech Stack

- **AI:** OpenAI GPT-4o (structured JSON output via function calling)
- **Backend:** FastAPI (Python 3.10+)
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **PDF Parsing:** PyMuPDF (`fitz`)
- **Charts:** Recharts

### Target Metrics (for CV)

- ATS compatibility score with per-section breakdown
- Keyword match rate across hard skills, soft skills, and role-specific terms
- Sub-2s response time for single resume analysis
- Support for PDF and plain text resume input

---

## 2. AI & Analysis Engine

### 2.1 Input Format

```python
{
    "resume_text": "...",       # extracted from PDF or pasted directly
    "job_description": "...",   # pasted by user
    "role_title": "..."         # optional, extracted from JD automatically
}
```

### 2.2 Output Schema (GPT-4o JSON Mode)

```json
{
  "overall_score": 78,
  "verdict": "Strong match with keyword gaps",
  "sections": {
    "summary": { "score": 85, "feedback": "...", "rewrite": "..." },
    "experience": { "score": 72, "feedback": "...", "rewrite": "..." },
    "skills": { "score": 65, "feedback": "...", "rewrite": "..." },
    "education": { "score": 90, "feedback": "..." }
  },
  "keywords": {
    "matched": ["React", "TypeScript", "REST API"],
    "missing_critical": ["Next.js", "CI/CD", "Agile"],
    "missing_nice_to_have": ["Docker", "GraphQL"],
    "overused": ["responsible for", "helped with"]
  },
  "ats_flags": [
    "No measurable achievements in Experience section",
    "Summary is too generic — lacks role-specific keywords",
    "Skills section uses paragraph format instead of list"
  ],
  "quick_wins": [
    "Add 'Next.js' to Skills — appears 4x in JD",
    "Quantify at least 2 experience bullet points",
    "Replace 'responsible for' with action verbs"
  ]
}
```

### 2.3 Prompt Engineering Strategy

The system prompt instructs GPT-4o to act as a senior ATS specialist and technical recruiter. Key design decisions:

| Decision | Rationale |
|---|---|
| JSON mode (`response_format: json_object`) | Eliminates parsing errors, consistent schema |
| Section-level scoring | More actionable than a single score |
| `quick_wins` array | Highest-impact, lowest-effort changes first |
| `ats_flags` separate from `feedback` | Flags are binary problems; feedback is qualitative |
| Temperature 0.3 | Consistent, professional tone — no hallucination creep |

### 2.4 PDF Parsing

```python
import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()
```

---

## 3. Architecture

### 3.1 System Architecture

```
┌──────────────────────────────────────────────────┐
│                   FRONTEND                        │
│              Next.js 14 + Tailwind                │
│                                                   │
│  ┌─────────────────────┐  ┌────────────────────┐  │
│  │   Resume Upload /   │  │   Results Dashboard │  │
│  │   Text Paste + JD   │  │   Score + Feedback  │  │
│  └──────────┬──────────┘  └────────────────────┘  │
│             │                                      │
└─────────────┼────────────────────────────────────┘
              │ HTTP / JSON
┌─────────────▼────────────────────────────────────┐
│                    BACKEND                         │
│                    FastAPI                          │
│                                                    │
│  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ POST /analyze│  │ POST /parse-pdf           │   │
│  │ resume + JD  │  │ PDF → extracted text      │   │
│  └──────┬───────┘  └──────────────────────────┘   │
│         │                                          │
│  ┌──────▼───────────────────────────────────────┐  │
│  │              AnalysisService                  │  │
│  │  1. PDF parse (if needed)                    │  │
│  │  2. Build prompt                             │  │
│  │  3. Call OpenAI GPT-4o (JSON mode)           │  │
│  │  4. Parse + validate response                │  │
│  │  5. Return structured result                 │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
              │
┌─────────────▼────────────┐
│    OpenAI API             │
│    GPT-4o, JSON mode      │
│    Temperature 0.3        │
└───────────────────────────┘
```

### 3.2 API Endpoints

#### POST /api/analyze

Main analysis endpoint.

```json
// Request (multipart/form-data OR JSON)
{
  "resume_text": "John Doe\nFrontend Developer...",
  "job_description": "We are looking for a React developer...",
}
// OR: resume_file (PDF upload) + job_description (text field)

// Response
{
  "overall_score": 78,
  "verdict": "Strong match with keyword gaps",
  "sections": { ... },
  "keywords": { ... },
  "ats_flags": [ ... ],
  "quick_wins": [ ... ],
  "processing_time_ms": 1840
}
```

#### POST /api/parse-pdf

PDF text extraction only (used by frontend for preview).

```json
// Request: multipart/form-data, file field "pdf"

// Response
{
  "text": "Extracted resume text...",
  "page_count": 2,
  "char_count": 3420
}
```

#### GET /api/health

```json
{ "status": "ok", "version": "1.0.0" }
```

---

## 4. Frontend Specification

### 4.1 Pages & Layout

Single-page application with two states: **Input View** and **Results View**.

### Input View

- Left panel: Resume input
  - Tab toggle: "Upload PDF" / "Paste Text"
  - PDF upload zone with drag-and-drop, shows extracted text preview
  - Character count
- Right panel: Job Description
  - Large textarea
  - "Paste from URL" button (optional stretch goal)
- Bottom: "Analyze Match" CTA button (disabled until both fields filled)
- Loading state: animated progress bar with status messages ("Parsing resume...", "Analyzing keywords...", "Generating feedback...")

### Results View

- **Score header:** Large circular gauge showing overall score (0–100) with color coding and verdict text
- **Quick Wins card:** Top 3 action items, highlighted in yellow/amber
- **ATS Flags card:** Red-flagged issues
- **Keyword Analysis panel:**
  - Green pills: matched keywords
  - Red pills: missing critical keywords
  - Orange pills: missing nice-to-have keywords
  - Gray pills: overused phrases
- **Section Breakdown:**
  - Accordion cards for Summary, Experience, Skills, Education
  - Each card: score bar, feedback text, "Suggested Rewrite" toggle (collapses/expands)
- **"Analyze Another" button:** resets to Input View

### 4.2 Component Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── input/
│   │   ├── ResumeInput.tsx       # PDF upload + text paste tabs
│   │   ├── PdfUploadZone.tsx     # drag-drop zone
│   │   ├── JDInput.tsx           # job description textarea
│   │   └── AnalyzeButton.tsx
│   ├── results/
│   │   ├── ScoreGauge.tsx        # circular score chart (Recharts RadialBarChart)
│   │   ├── QuickWins.tsx
│   │   ├── AtsFlags.tsx
│   │   ├── KeywordPanel.tsx      # matched/missing/overused pills
│   │   └── SectionAccordion.tsx  # per-section score + rewrite
│   └── ui/
│       ├── LoadingBar.tsx
│       ├── Pill.tsx
│       └── ErrorAlert.tsx
├── lib/
│   ├── api.ts
│   ├── types.ts
│   └── utils.ts
```

### 4.3 Color Scheme & Styling

- **Background:** Dark theme (`bg-gray-950`)
- **Cards:** `bg-gray-900` with `border-gray-800`
- **Score colors:**
  - 0–49: Red `#ef4444`
  - 50–69: Orange `#f97316`
  - 70–84: Yellow `#eab308`
  - 85–100: Green `#22c55e`
- **Keyword pills:**
  - Matched: green tint
  - Missing critical: red tint
  - Missing nice-to-have: orange tint
  - Overused: gray tint
- **Primary accent:** Blue `#3b82f6` for buttons and active states

---

## 5. Backend Specification

### 5.1 Project Structure

```
backend/
├── main.py
├── requirements.txt
├── config.py
├── routers/
│   ├── analyze.py
│   └── pdf.py
├── services/
│   ├── analysis_service.py   # orchestrates PDF parse + OpenAI call
│   ├── openai_service.py     # GPT-4o call with JSON mode
│   └── pdf_service.py        # PyMuPDF extraction
├── schemas/
│   ├── requests.py
│   └── responses.py
└── prompts/
    └── analysis_prompt.py    # system + user prompt templates
```

### 5.2 Analysis Service

```python
class AnalysisService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def analyze(self, resume_text: str, job_description: str) -> AnalysisResult:
        prompt = build_analysis_prompt(resume_text, job_description)

        response = await self.openai_client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            temperature=0.3,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]
        )

        raw = response.choices[0].message.content
        return AnalysisResult.model_validate_json(raw)
```

### 5.3 Prompt Template

```python
SYSTEM_PROMPT = """
You are a senior ATS specialist and technical recruiter with 10+ years of experience.
You analyze resumes against job descriptions and return structured JSON feedback.
Always respond with valid JSON matching the exact schema provided.
Be specific, actionable, and concise. Never fabricate experience or suggest adding false information.
"""

def build_analysis_prompt(resume: str, jd: str) -> str:
    return f"""
Analyze the following resume against the job description.
Return JSON matching this exact schema: {RESPONSE_SCHEMA}

RESUME:
{resume}

JOB DESCRIPTION:
{jd}
"""
```

### 5.4 Environment Variables

```
OPENAI_API_KEY=sk-...
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000
MAX_RESUME_CHARS=15000
MAX_JD_CHARS=8000
```

---

## 6. Implementation Plan (4-Day Schedule)

### Day 1 — Backend Core

1. Initialize FastAPI project with structure above
2. Implement PDF extraction service (PyMuPDF)
3. Design and test OpenAI prompt — iterate until JSON schema is consistent
4. Implement `/api/analyze` and `/api/parse-pdf` endpoints
5. Test with 3–5 real resume + JD pairs via Swagger UI

### Day 2 — Frontend Input View

1. Initialize Next.js 14 project with Tailwind
2. Build layout, PDF upload zone with drag-and-drop
3. Build JD textarea input
4. Connect to `/api/parse-pdf` for live text extraction preview
5. Wire "Analyze Match" button to `/api/analyze`
6. Add loading state with animated progress bar

### Day 3 — Frontend Results View

1. Build ScoreGauge (Recharts RadialBarChart)
2. Build KeywordPanel with color-coded pills
3. Build SectionAccordion with score bars and rewrite toggle
4. Build QuickWins and AtsFlags cards
5. Polish transitions between Input View and Results View

### Day 4 — Polish + README

1. Add error handling (invalid PDF, OpenAI timeout, empty fields)
2. Mobile responsiveness check
3. Test with 10+ diverse resume + JD pairs
4. Record demo GIF for README
5. Write README with screenshots, setup instructions, and design decisions

---

## 7. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| AI layer | OpenAI GPT-4o over fine-tuned model | No training needed, no class imbalance, near-perfect NLP quality |
| Response format | JSON mode (`response_format: json_object`) | Eliminates brittle regex parsing, consistent schema every time |
| PDF parsing | PyMuPDF over pdfminer | 3x faster, cleaner text extraction, actively maintained |
| Temperature | 0.3 | Consistent tone without hallucination; higher temps produce unstable JSON |
| Score display | Circular gauge + per-section bars | Actionable hierarchy — overall first, then drill down |
| Quick Wins | Separate top-level field | Users read this first; highest ROI changes surfaced immediately |
| No database | Stateless API | No storage needed; each request is self-contained |
| CORS | Configured per env | Enables local dev + easy production deployment |

---

## 8. Known Limitations & Mitigations

| Limitation | Mitigation |
|---|---|
| GPT-4o may miss niche domain keywords | Prompt explicitly instructs extraction from JD verbatim |
| Scanned PDFs (image-based) won't parse | Show error with instruction to paste text instead |
| OpenAI rate limits on free tier | Add retry logic with exponential backoff |
| Very long resumes (3+ pages) may exceed context | Truncate to `MAX_RESUME_CHARS` with user warning |

---

## 9. README Template

```markdown
# AI Resume & JD Matcher

Analyzes your resume against a job description using GPT-4o.
Returns ATS compatibility score, keyword gaps, section feedback, and rewrite suggestions.

## Demo
[gif/screenshot here]

## Features
- PDF upload or paste resume text
- Instant ATS score (0–100) with per-section breakdown
- Keyword gap analysis: matched, missing critical, missing nice-to-have
- AI-generated rewrite suggestions for each resume section
- Quick wins — top 3 highest-impact changes

## Tech Stack
- **AI:** OpenAI GPT-4o (JSON mode)
- **Backend:** FastAPI, PyMuPDF
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # add OPENAI_API_KEY
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture
[diagram here]

## Design Decisions
[link to PRD or inline table]
```

---

## 10. Claude Code Development Instructions

### Phase 1: Backend + Prompt Engineering
```
"Set up FastAPI backend following section 5.1 structure.
Implement the PDF extraction service using PyMuPDF.
Build the OpenAI service with JSON mode and the prompt template from section 5.3.
Test the prompt with a sample resume and JD — iterate until the JSON schema is consistent across 3 runs."
```

### Phase 2: API Endpoints
```
"Implement /api/analyze and /api/parse-pdf following schemas in section 3.2.
Add Pydantic validation for request and response models.
Include error handling for invalid PDFs, oversized inputs, and OpenAI failures."
```

### Phase 3: Frontend Input View
```
"Build Next.js 14 frontend following component structure in section 4.2.
Start with layout, PDF upload zone (drag-and-drop), JD textarea, and Analyze button.
Connect to /api/parse-pdf for live text preview after PDF upload.
Add loading bar with status messages during analysis."
```

### Phase 4: Frontend Results View
```
"Build the Results View following section 4.1.
Implement ScoreGauge with Recharts RadialBarChart.
Build KeywordPanel with color-coded pills.
Build SectionAccordion with collapse/expand for rewrite suggestions.
Add QuickWins and AtsFlags cards."
```

### Phase 5: Polish
```
"Add error states, mobile responsiveness, and transitions between views.
Test with 10 diverse resume + JD pairs.
Record demo GIF and write README."
```
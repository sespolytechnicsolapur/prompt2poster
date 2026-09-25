# Prompt2Poster — Full-Stack AI Poster Evaluation Platform

**Prompt2Poster** is a full-stack AI-powered judging and evaluation platform designed for college **AI Poster Making Challenges**. 

During competition events, contestants receive a poster topic on-site, design their poster, and submit it directly to Prompt2Poster. The application automatically uploads the poster to cloud storage, evaluates the visual design using Groq AI and Qwen 3.8 vision models against 7 strict criteria, validates score mathematical integrity, stores results in Supabase, and updates a real-time live leaderboard with full score transparency.

---

## 🚀 Key Features

* **Dynamic Competition Topic Banner**: Organizers can update active competition topics in real-time; topics are dynamically loaded across contestant portals and AI evaluation prompts.
* **Streamlined Poster Submission**: Contestant name input, drag-and-drop poster image uploader, format/size validation, and high-definition live preview.
* **AI Visual Judging (Groq + Qwen 3.8)**: Secure server-side processing layer that analyzes submitted poster images across 8 official evaluation criteria.
* **Strict Score Integrity Validation**: Enforces exact mathematical bounds, score maximums, and sum calculations before saving entries to the database.
* **Live Contestant Leaderboard**: Real-time rankings sorted by score out of 100 with search filter controls and contestant rank badges.
* **Transparent Submission Breakdown**: Deep-dive audit page displaying high-res poster view, 8-criteria progress meters, AI rationale descriptions, concrete identified issues, and executive summary.
* **Cloud & Local Storage Resiliency**: Direct integration with Supabase DB & Supabase Storage with local storage fallback for immediate plug-and-play testing.

---

## 🛠️ Technology Stack

* **Frontend**: React, JavaScript (ES6+), Vite, Lucide React Icons
* **Styling**: Vanilla CSS3, Modern CSS Variables, Glassmorphic AI Dark Mode Theme
* **Backend Proxy Layer**: Node.js, Express, CORS, Dotenv
* **Database**: Supabase PostgreSQL
* **Cloud Storage**: Supabase Storage (`posters` bucket)
* **AI Evaluation Engine**: Groq API ('qwen/qwen3.8-27b`)

---

## 🔄 How It Works

```text
Contestant Name + Poster Upload
               ↓
Upload to Supabase Cloud Storage
               ↓
Server-side Processing & Groq AI Vision Analysis
               ↓
Structured 8-Criteria Score Generation (/100)
               ↓
Mathematical Score Integrity Check
               ↓
Save to Supabase Database
               ↓
Live Leaderboard Update & Transparent Breakdown
```

---

## 📊 Official 8 Evaluation Criteria

Every poster is judged objectively according to these exact 8 criteria:

| Criterion | Maximum Score | Description |
| :--- | :---: | :--- |
| **Relevance to Topic** | **20 Pts** | Evaluates how directly and effectively the poster represents the assigned topic. |
| **Visual Hierarchy** | **15 Pts** | Evaluates focal point clarity and how viewer attention is guided naturally. |
| **Typography / Readability** | **10 Pts** | Evaluates text clarity, font legibility, sizing, contrast, and reading flow. |
| **Composition / Layout** | **15 Pts** | Evaluates spatial balance, alignment, element arrangement, and margin grid. |
| **Creativity / Originality** | **15 Pts** | Evaluates artistic concept novelty and distinctive visual presentation. |
| **Color Usage** | **10 Pts** | Evaluates color harmony, contrast, consistency, and visual tone. |
| **Overall Communication** | **5 Pts** | Evaluates how effectively the poster conveys its intended core takeaway. |
| **Prompt Authenticity** | **10 Pts** | Evaluates whether the prompt used seems human-written and accurately describes the poster. |
| **TOTAL** | **100 Pts** | **Sum of all 8 individual scores** |

---

## 📁 Project Structure

```text
Prompt2Poster/
│
├── public/
│   ├── favicon.svg          # Platform Favicon
│   └── assets/
│
├── server/
│   └── index.js             # Express Backend Proxy (Protects GROQ_API_KEY)
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Header navigation & topic badge
│   │   ├── Footer.jsx            # Platform footer & criteria summary
│   │   ├── TopicBanner.jsx       # Active competition topic banner
│   │   ├── PosterUploader.jsx    # Drag-and-drop file uploader
│   │   ├── PosterPreview.jsx     # HD poster preview container & modal
│   │   ├── EvaluationLoader.jsx  # Multi-stage AI processing progress loader
│   │   ├── ScoreBreakdown.jsx    # 8-criteria progress meters & reasoning
│   │   ├── IssueList.jsx         # AI identified critique points list
│   │   ├── LeaderboardTable.jsx  # Live rankings table with search filter
│   │   ├── LeaderboardRow.jsx    # Single contestant rank row
│   │   └── SubmissionCard.jsx    # Grid card summary component
│   │
│   ├── pages/
│   │   ├── Home.jsx              # Landing page & criteria overview
│   │   ├── Submit.jsx            # Contestant poster submission portal
│   │   ├── Leaderboard.jsx       # Live standings & contestant rankings
│   │   ├── SubmissionDetails.jsx # Transparent score breakdown audit view
│   │   └── TopicManagement.jsx   # Organizer active topic management
│   │
│   ├── services/
│   │   ├── supabase.js           # Supabase client initialization
│   │   ├── storageService.js     # Image upload to Supabase Storage
│   │   ├── submissionService.js  # Database CRUD for topics & submissions
│   │   └── evaluationService.js # AI evaluation API caller
│   │
│   ├── utils/
│   │   ├── validation.js         # Input & file format validation
│   │   ├── scoreValidation.js    # 8-criteria score mathematical validator
│   │   └── formatters.js         # Date & score color formatters
│   │
│   ├── hooks/
│   │   └── useCompetition.js    # Custom hook for topic & leaderboard state
│   │
│   ├── styles/
│   │   ├── globals.css           # Global layout & utility classes
│   │   └── variables.css         # Dark-mode color tokens & typography
│   │
│   ├── App.jsx                   # Main React routing wrapper
│   └── main.jsx                  # React DOM entrypoint
│
├── supabase/
│   ├── schema.sql                # Complete PostgreSQL DB & RLS schema
│   └── README.md                 # Supabase setup guide
│
├── .env.example                  # Environment configuration template
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔑 Environment Variables Setup

Copy `.env.example` to create `.env`:

```bash
cp .env.example .env
```

Configure your credentials in `.env`:

```env
# Supabase Configuration (Client-side)
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Groq API Configuration (Server-side ONLY)
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.2-11b-vision-preview

# Server Port
PORT=3001
```

---

## 🗄️ Supabase Database & Storage Setup :

1. Open your [Supabase Dashboard](https://supabase.com).
2. Navigate to **SQL Editor** and run the contents of [`supabase/schema.sql`](file:///C:/Users/HP/.gemini/antigravity/scratch/Prompt2Poster/supabase/schema.sql).
3. Under **Storage**, ensure the public bucket `posters` is created and public access is enabled.
4. Detailed setup steps are documented in [`supabase/README.md`](file:///C:/Users/HP/.gemini/antigravity/scratch/Prompt2Poster/supabase/README.md).

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. Navigate to the project directory:
   ```bash
   cd Prompt2Poster
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server (runs Vite client & Express backend simultaneously):
   ```bash
   npm run dev
   ```

4. Open browser at `http://localhost:5173`.

---

## 🌐 Production Build & Deployment

To generate an optimized production bundle:

```bash
npm run build
```

* **Frontend**: Deploy the built static assets in `dist/` to Vercel, Netlify, or Cloudflare Pages.
* **Backend**: Deploy `server/index.js` to Node.js hosting (e.g. Render, Railway, Vercel Serverless Functions) and set `GROQ_API_KEY` in environment secrets..

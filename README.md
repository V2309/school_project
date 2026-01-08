📚 UniAI - Online Classroom Management System
🔍 Overview
UniAI is a comprehensive online learning platform integrated with an intelligent AI Agent. It empowers educators and students with:

Intuitive Dashboard: Effortlessly manage classes, assignments, and grades.

AI Chatbot (RAG): Interact directly with study materials using Retrieval-Augmented Generation.

Automated Assessments: Generate multiple-choice and essay questions instantly from PDF/DOCX files.

Study Podcasts: Convert static documents into engaging educational podcasts.

🎯 Target Audience: Students, Lecturers, and Educational Institutions.

🧑‍💻 Tech Stack
Frontend
Next.js 14 – React framework with App Router.

TypeScript – Type-safe development.

Tailwind CSS – Utility-first styling.

Prisma ORM – Database management with PostgreSQL.

Clerk – Authentication & User management.

TanStack Query – Server state management.

React Hook Form + Zod – Form handling and validation.

Pusher – Real-time communication.

Stream.io – Integrated video conferencing.

Recharts – Data visualization.

Backend
FastAPI (Python) – High-performance API framework.

LangChain – AI Agent orchestration.

Google Gemini AI – Core Large Language Model.

OpenAI API – Text-to-Speech (TTS) for podcasts.

FAISS + BM25 – Hybrid vector search for RAG.

PyMuPDF – Efficient PDF processing.

Database & Storage
PostgreSQL – Primary relational database.

AWS S3 – Secure file storage.

ImageKit – Real-time image optimization.

DevOps
Vercel – Frontend & Backend deployment.

✨ Key Features
🤖 AI Learning Assistant
Contextual Chat: Ask questions directly about uploaded documents (PDF/DOCX).

Smart Search: Powered by RAG for highly accurate information retrieval.

Automatic Quiz Gen: Instantly create quizzes to test knowledge.

🎙️ Podcast Generator
PDF to Audio: Converts text-heavy documents into natural conversational podcasts.

Natural TTS: High-quality, lifelike AI voices.

Offline Learning: Downloadable MP3 files for learning on the go.

📝 Quiz Management
Extraction: Intelligent extraction of test questions from documents.

Customization: Shuffle questions/answers and manage difficulty.

Export: Export exams to PDF or Excel formats.

👨‍🎓 Learning Management System (LMS)
User Roles: Dedicated workflows for Administrators, Teachers, and Students.

Grading System: Easy assignment submission and grading interface.

Scheduling: Integrated calendar using React Big Calendar.

Virtual Classroom: High-quality video conferencing and real-time discussion boards.

📊 Dashboard & Analytics
Performance Tracking: Visualize grade trends with interactive charts.

Progress Monitoring: Stay updated on course completion and student engagement.

Fully Responsive: Optimized experience across Desktop, Tablet, and Mobile.

🖼️ Demo
🔗 Live Demo: https://vanan-school-online.vercel.app/

⚙️ Installation & Setup
Prerequisites
Node.js 18+

Python 3.10+

PostgreSQL instance

Git

1. Clone the Repository
Bash

git clone https://github.com/V2309/school_project.git
cd school_project
2. Frontend Setup (Next.js)
Bash

cd next-dashboard-ui
npm install

# Create a .env.local file and configure:
# DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, etc.

# Run database migrations
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
The frontend will be available at: http://localhost:3000

3. Backend Setup (FastAPI)
Bash

cd backend
pip install -r requirements.txt

# Create a .env file and configure:
# GOOGLE_API_KEY, OPENAI_API_KEY, TAVILY_API_KEY

# Start the API server
uvicorn index:app --reload --port 8000
The backend API will be available at: http://localhost:8000

📁 Project Structure
Plaintext

school_project/
├── next-dashboard-ui/          # Frontend Next.js
│   ├── src/
│   │   ├── app/                # App Router (Pages & APIs)
│   │   ├── components/         # Reusable UI components
│   │   ├── lib/                # Utilities, hooks & configs
│   ├── prisma/                 # Database schema & migrations
│   └── package.json
│
├── backend/                    # Backend FastAPI
│   ├── index.py                # Main API entry point
│   ├── agent_core.py           # LangChain AI Agent logic
│   ├── podcast_generator.py    # Document-to-Audio logic
│   ├── prompt_template.py      # AI System Prompts
│   └── requirements.txt
│
└── README.md
🚀 Deployment
Frontend: Deployed on Vercel with CI/CD integration.

Backend: Deployed using Vercel Serverless Functions (refer to vercel.json).

# 📚 UniAI - Online Classroom Management System

## 🔍 Overview
**UniAI** is a comprehensive AI-powered online learning platform that helps students: 
- Interact with learning materials through an intelligent AI chatbot (RAG - Retrieval Augmented Generation)
- Automatically generate multiple-choice and essay questions from PDF/DOCX files
- Convert documents into educational podcasts
- Manage classes, assignments, and grades with an intuitive dashboard

**🎯 Target Users:** Students, educators, and educational institutions

---

## 🧑‍💻 Tech Stack

### **Frontend**
- **Next.js 14** - React Framework with App Router
- **TypeScript** - Type-safe development (92.9% of codebase)
- **Tailwind CSS** - Utility-first CSS framework
- **Prisma ORM** - Database ORM with PostgreSQL
- **Clerk** - Authentication & User Management
- **Radix UI** - Accessible component library
- **React Hook Form + Zod** - Form validation
- **TanStack Query** - Server state management
- **Socket.io Client** - Real-time communication
- **Stream. io** - Video conferencing
- **Recharts** - Data visualization

### **Backend AI chatbot RAG**
- **FastAPI** (Python 3.10+) - High-performance API framework
- **LangChain** - AI Agent orchestration
- **Google Gemini AI** - Large Language Model
- **OpenAI API** - Text-to-Speech (TTS)
- **FAISS + BM25** - Hybrid vector search
- **PyMuPDF** - PDF processing
- **Pusher** - Real-time notifications

### **Database & Storage**
- **PostgreSQL** - Primary database
- **AWS S3** - File storage
- **ImageKit** - Image optimization

### **DevOps**
- **Vercel** - Frontend & Backend deployment
- **Jest** - Unit testing
- **ESLint** - Code linting

---

## ✨ Key Features

### 🤖 **AI Learning Assistant**
- Chat with AI about uploaded document content (PDF/DOCX)
- Intelligent search with RAG (Retrieval Augmented Generation)
- Auto-generate multiple-choice and essay questions

### 🎙️ **Podcast Generator**
- Convert PDF documents into conversational podcasts
- Natural Text-to-Speech conversion
- Download audio files in MP3 format

### 📝 **Quiz Management**
- Extract quizzes from PDF/DOCX files
- Shuffle questions and answers
- Export quizzes to PDF/Excel

### 👨‍🎓 **Learning Management System (LMS)**
- Manage classes, students, and teachers
- Assign and grade homework
- Calendar with React Big Calendar
- Integrated video conferencing
- Real-time discussions with Socket.io

### 📊 **Dashboard & Analytics**
- Grade statistics with charts
- Track learning progress
- Responsive design for all devices

---

## 🖼️ Demo

🔗 **Live Demo:** [https://vanan-school-online.vercel.app/](https://vanan-school-online.vercel.app/)

> **Note:** Backend API requires API key configuration for full functionality

### 📸 Screenshots
_(Consider adding 3-4 screenshots here for professional presentation)_
- Dashboard overview
- AI Chat interface
- Quiz management
- Calendar view

---

## ⚙️ Installation & Setup

### **Prerequisites**
- Node.js 18+
- Python 3.10+
- PostgreSQL
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/V2309/school_project.git
cd school_project
```

### **2. Frontend Setup (Next.js)**
```bash
cd next-dashboard-ui
npm install

# Create .env. local with required variables: 
# DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, etc. 

# Run database migration
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```
Frontend will run at: **http://localhost:3000**

### **3. Backend Setup (FastAPI)**
```bash
cd backend
pip install -r requirements.txt

# Create .env file with:
# GOOGLE_API_KEY, OPENAI_API_KEY, TAVILY_API_KEY

# Start server
uvicorn index:app --reload --port 8000
```
Backend API will run at: **http://localhost:8000**

---

## 📁 Project Structure

```
school_project/
├── next-dashboard-ui/          # Frontend Next.js
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities & configs
│   ├── prisma/               # Database schema
│   └── package. json
│
├── backend/                   # Backend FastAPI
│   ├── index.py              # Main API endpoints
│   ├── agent_core.py         # LangChain AI Agent
│   ├── podcast_generator.py  # TTS conversion
│   ├── prompt_template.py    # AI prompts
│   └── requirements.txt
│
└── README.md
```

---

## 🧪 Testing

```bash
# Frontend tests
cd next-dashboard-ui
npm test

# Backend tests
cd backend
python test_quiz_api. py
```

---

## 🚀 Deployment

- **Frontend:** Vercel (auto-deploy from GitHub)
- **Backend:** Vercel Serverless Functions (see `vercel.json`)

### Environment Variables Required

**Frontend (. env.local):**
```env
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_... 
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=... 
```

**Backend (.env):**
```env
GOOGLE_API_KEY=...
GOOGLE_API_KEY_BACKUP=...
OPENAI_API_KEY=...
TAVILY_API_KEY=...
```

---

## 🏆 Project Highlights

- **Full-stack TypeScript/Python** application with modern architecture
- **AI/ML Integration** using LangChain and Google Gemini
- **Real-time Features** with Socket.io and Pusher
- **Production-ready** deployment on Vercel
- **Scalable** database design with Prisma ORM
- **Type-safe** development with TypeScript and Zod

---

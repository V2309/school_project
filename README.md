# 📚 UniAI - Hệ Thống Hỗ Trợ Học Tập Thông Minh

## 🔍 Mô tả
**UniAI** là một nền tảng học tập trực tuyến toàn diện với AI Agent thông minh, giúp sinh viên: 
- Tương tác với tài liệu học tập thông qua AI chatbot (RAG - Retrieval Augmented Generation)
- Tự động tạo đề thi trắc nghiệm và tự luận từ PDF/DOCX
- Chuyển đổi tài liệu thành podcast học tập
- Quản lý lớp học, bài tập và điểm số với dashboard trực quan

**🎯 Dự án phục vụ:** Sinh viên, giảng viên và các tổ chức giáo dục

---

## 🧑‍💻 Công nghệ sử dụng

### **Frontend**
- **Next.js 14** - React Framework với App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Prisma ORM** - Database ORM với PostgreSQL
- **Clerk** - Authentication & User Management
- **Radix UI** - Accessible component library
- **React Hook Form + Zod** - Form validation
- **TanStack Query** - Server state management
- **Socket.io Client** - Real-time communication
- **Stream.io** - Video conferencing
- **Recharts** - Data visualization

### **Backend**
- **FastAPI** (Python) - High-performance API framework
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
- **Vercel** - Frontend deployment
- **Jest** - Unit testing
- **ESLint** - Code linting

---

## ✨ Tính năng chính

### 🤖 **AI Learning Assistant**
- Chat với AI về nội dung tài liệu đã upload (PDF/DOCX)
- Tìm kiếm thông minh với RAG (Retrieval Augmented Generation)
- Tự động tạo câu hỏi trắc nghiệm và tự luận

### 🎙️ **Podcast Generator**
- Chuyển đổi tài liệu PDF thành cuộc hội thoại podcast
- Text-to-Speech với giọng đọc tự nhiên
- Tải xuống file audio MP3

### 📝 **Quiz Management**
- Trích xuất đề thi từ file PDF/DOCX
- Xáo trộn câu hỏi và đáp án
- Export đề thi ra PDF/Excel

### 👨‍🎓 **Learning Management System (LMS)**
- Quản lý lớp học, học sinh, giảng viên
- Giao bài tập và chấm điểm
- Lịch học với React Big Calendar
- Video conference tích hợp
- Thảo luận real-time với Socket.io

### 📊 **Dashboard & Analytics**
- Thống kê điểm số với biểu đồ
- Theo dõi tiến độ học tập
- Responsive design cho mọi thiết bị

---

## 🖼️ Demo

🔗 **Live Demo:** [https://vanan-school-online.vercel.app/](https://vanan-school-online.vercel.app/)

> **Lưu ý:** Backend API cần cấu hình API keys để chạy đầy đủ tính năng

### 📸 Screenshots
_(Bạn nên thêm 3-4 ảnh chụp màn hình ở đây để tăng tính chuyên nghiệp)_
- Dashboard overview
- AI Chat interface
- Quiz management
- Calendar view

---

## ⚙️ Cài đặt & Chạy dự án

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

### **2. Cài đặt Frontend (Next.js)**
```bash
cd next-dashboard-ui
npm install

# Tạo file .env.local với các biến: 
# DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, etc. 

# Chạy migration database
npx prisma generate
npx prisma db push

# Khởi động dev server
npm run dev
```
Frontend sẽ chạy tại:  **http://localhost:3000**

### **3. Cài đặt Backend (FastAPI)**
```bash
cd backend
pip install -r requirements.txt

# Tạo file .env với: 
# GOOGLE_API_KEY, OPENAI_API_KEY, TAVILY_API_KEY

# Chạy server
uvicorn index:app --reload --port 8000
```
Backend API sẽ chạy tại: **http://localhost:8000**

---

## 📁 Cấu trúc thư mục

```
school_project/
├── next-dashboard-ui/          # Frontend Next.js
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities & configs
│   ├── prisma/               # Database schema
│   └── package.json
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
python test_quiz_api.py
```

---

## 🚀 Deployment

- **Frontend:** Vercel (auto-deploy từ GitHub)
- **Backend:** Vercel Serverless Functions (xem `vercel.json`)

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón!  Vui lòng: 
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📄 License

Dự án này được phát triển cho mục đích học tập. 

---

## 👤 Tác giả

**V2309** - [GitHub Profile](https://github.com/V2309)

⭐ Nếu bạn thấy project hữu ích, hãy cho một star nhé!

---

## 📞 Liên hệ

- Repository: [https://github.com/V2309/school_project](https://github.com/V2309/school_project)
- Live Demo: [https://vanan-school-online.vercel.app/](https://vanan-school-online.vercel.app/)
```

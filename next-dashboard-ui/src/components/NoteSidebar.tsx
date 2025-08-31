import React, { useState, useEffect } from "react";
import {
  Plus,
  BookOpen,
  FileText,
  HelpCircle,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
} from "lucide-react";

// ====================
// Type definitions
// ====================
export type NoteType = "manual" | "study_guide" | "summary" | "faq";

export interface Note {
  id: number;
  title: string;
  content: string;
  type: NoteType;
  createdAt: string;
  updatedAt?: string;
  isGenerated: boolean;
}

interface NoteSidebarProps {
  sessionId: string | null;
  onNoteSelect?: (note: Note) => void;
}

const NoteSidebar: React.FC<NoteSidebarProps> = ({ sessionId, onNoteSelect }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState<{
    title: string;
    content: string;
    type: NoteType;
  }>({ title: "", content: "", type: "manual" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<NoteType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load notes từ localStorage khi component mount
  useEffect(() => {
    if (sessionId) {
      const savedNotes = localStorage.getItem(`notes_${sessionId}`);
      if (savedNotes) {
        try {
          const parsedNotes: Note[] = JSON.parse(savedNotes);
          setNotes(parsedNotes);
        } catch (error) {
          console.error("[ERROR] Failed to parse saved notes:", error);
          setNotes([]);
        }
      } else {
        setNotes([]);
      }
      setIsInitialized(true);
    }
  }, [sessionId]);

  // Save notes to localStorage khi notes thay đổi (chỉ sau khi đã load xong)
  useEffect(() => {
    if (sessionId && isInitialized) {
      localStorage.setItem(`notes_${sessionId}`, JSON.stringify(notes));
    }
  }, [notes, sessionId, isInitialized]);

  const generateNoteContent = async (type: NoteType) => {
    setIsGenerating(true);
    setGeneratingType(type);
    try {
      const response = await fetch("http://localhost:8000/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, note_type: type }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate note");
      }

      const data = await response.json();

      const noteTypeMap: Record<NoteType, string> = {
        study_guide: "📖 Hướng dẫn học tập",
        summary: "📚 Tài liệu tóm tắt",
        faq: "❓ Câu hỏi thường gặp",
        manual: "Ghi chú mới",
      };

      const newGeneratedNote: Note = {
        id: Date.now(),
        title: noteTypeMap[type] || "Ghi chú mới",
        content: data.content,
        type,
        createdAt: new Date().toISOString(),
        isGenerated: true,
      };

      setNotes((prev) => [newGeneratedNote, ...prev]);
    } catch (error: any) {
      alert(
        `Lỗi: ${
          error.response?.data?.detail ||
          error.message ||
          "Có lỗi xảy ra khi tạo ghi chú tự động"
        }`
      );
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleCreateManualNote = () => {
    setIsCreatingNote(true);
    setNewNote({ title: "", content: "", type: "manual" });
  };

  const handleSaveNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    const note: Note = {
      id: Date.now(),
      title: newNote.title,
      content: newNote.content,
      type: newNote.type,
      createdAt: new Date().toISOString(),
      isGenerated: false,
    };

    setNotes((prev) => [note, ...prev]);
    setIsCreatingNote(false);
    setNewNote({ title: "", content: "", type: "manual" });
  };

  const handleEditNote = (noteId: number) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setNewNote({ title: note.title, content: note.content, type: note.type });
      setEditingNoteId(noteId);
    }
  };

  const handleUpdateNote = () => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === editingNoteId
          ? {
              ...note,
              title: newNote.title,
              content: newNote.content,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
    setEditingNoteId(null);
    setNewNote({ title: "", content: "", type: "manual" });
  };

  const handleDeleteNote = (noteId: number) => {
    if (confirm("Bạn có chắc muốn xóa ghi chú này?")) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getTypeIcon = (type: NoteType) => {
    switch (type) {
      case "study_guide":
        return "📖";
      case "summary":
        return "📚";
      case "faq":
        return "❓";
      default:
        return "📝";
    }
  };

  return (
    <aside className="w-full h-full bg-gray-50 border-l border-gray-200 shadow-lg p-6 flex flex-col">
      <h2 className="text-xl font-semibold mb-5 text-gray-800">
        📝 Ghi chú & Hỗ trợ học tập
      </h2>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={handleCreateManualNote}
          disabled={!sessionId || isGenerating}
          className="bg-white border border-gray-300 rounded-md px-4 py-2 text-left hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Plus className="h-4 w-4 mr-2 text-blue-600" />
          Thêm ghi chú
        </button>

        <button
          onClick={() => generateNoteContent("study_guide")}
          disabled={!sessionId || isGenerating}
          className="bg-white border border-gray-300 rounded-md px-4 py-2 text-left hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isGenerating && generatingType === "study_guide" ? (
            <Loader2 className="h-4 w-4 mr-2 text-green-600 animate-spin" />
          ) : (
            <BookOpen className="h-4 w-4 mr-2 text-green-600" />
          )}
          {isGenerating && generatingType === "study_guide"
            ? "Đang phân tích tài liệu..."
            : "📖 Hướng dẫn học tập"}
        </button>

        <button
          onClick={() => generateNoteContent("summary")}
          disabled={!sessionId || isGenerating}
          className="bg-white border border-gray-300 rounded-md px-4 py-2 text-left hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isGenerating && generatingType === "summary" ? (
            <Loader2 className="h-4 w-4 mr-2 text-purple-600 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2 text-purple-600" />
          )}
          {isGenerating && generatingType === "summary"
            ? "Đang đọc kỹ tài liệu..."
            : "📚 Tài liệu tóm tắt"}
        </button>

        <button
          onClick={() => generateNoteContent("faq")}
          disabled={!sessionId || isGenerating}
          className="bg-white border border-gray-300 rounded-md px-4 py-2 text-left hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isGenerating && generatingType === "faq" ? (
            <Loader2 className="h-4 w-4 mr-2 text-orange-600 animate-spin" />
          ) : (
            <HelpCircle className="h-4 w-4 mr-2 text-orange-600" />
          )}
          {isGenerating && generatingType === "faq"
            ? "Đang tạo câu hỏi thường gặp..."
            : "❓ Câu hỏi thường gặp"}
        </button>
      </div>

      {/* Create/Edit Note Form */}
      {(isCreatingNote || editingNoteId) && (
        <div className="p-4 border border-gray-300 rounded-lg bg-blue-50 mb-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tiêu đề ghi chú..."
              value={newNote.title}
              onChange={(e) =>
                setNewNote((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <textarea
              placeholder="Nội dung ghi chú..."
              value={newNote.content}
              onChange={(e) =>
                setNewNote((prev) => ({ ...prev, content: e.target.value }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
            <div className="flex space-x-2">
              <button
                onClick={editingNoteId ? handleUpdateNote : handleSaveNote}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center text-sm"
              >
                <Save className="h-3 w-3 mr-1" />
                {editingNoteId ? "Cập nhật" : "Lưu"}
              </button>
              <button
                onClick={() => {
                  setIsCreatingNote(false);
                  setEditingNoteId(null);
                  setNewNote({ title: "", content: "", type: "manual" });
                }}
                className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition flex items-center justify-center text-sm"
              >
                <X className="h-3 w-3 mr-1" />
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {!sessionId
                ? "Vui lòng tải tài liệu để bắt đầu tạo ghi chú"
                : "Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => onNoteSelect && onNoteSelect(note)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 flex items-center text-sm">
                    <span className="mr-2">{getTypeIcon(note.type)}</span>
                    {note.title}
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditNote(note.id);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-2 line-clamp-3 max-h-12 overflow-hidden">
                  {note.content}
                </div>

                <div className="text-xs text-gray-400 flex justify-between items-center">
                  <span>{formatDate(note.createdAt)}</span>
                  {note.isGenerated && (
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                      AI tạo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default NoteSidebar;

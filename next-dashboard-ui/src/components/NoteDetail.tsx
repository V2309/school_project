// import React from "react";
// import { ArrowLeft, Edit3, Trash2, Clock, Tag } from "lucide-react";
// import ReactMarkdown, { Components } from "react-markdown";
// import remarkGfm from "remark-gfm";

// // Đồng bộ với NoteSidebar.tsx
// export type NoteType = "manual" | "study_guide" | "summary" | "faq";

// export interface Note {
//   id: number;
//   title: string;
//   content: string;
//   type: NoteType;
//   createdAt: string;
//   updatedAt?: string;
//   isGenerated: boolean;
// }

// interface NoteDetailProps {
//   note: Note | null;
//   onBack: () => void;
//   onEdit: (id: number) => void;
//   onDelete: (id: number) => void;
// }

// const NoteDetail: React.FC<NoteDetailProps> = ({ note, onBack, onEdit, onDelete }) => {
//   if (!note) return null;

//   const getTypeIcon = (type: NoteType) => {
//     switch (type) {
//       case "study_guide":
//         return "📖";
//       case "summary":
//         return "📚";
//       case "faq":
//         return "❓";
//       default:
//         return "📝";
//     }
//   };

//   const getTypeLabel = (type: NoteType) => {
//     switch (type) {
//       case "study_guide":
//         return "Hướng dẫn học tập";
//       case "summary":
//         return "Tài liệu tóm tắt";
//       case "faq":
//         return "Câu hỏi thường gặp";
//       default:
//         return "Ghi chú thủ công";
//     }
//   };

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleString("vi-VN");

//   // Tùy biến render markdown
//   const mdComponents: Components = {
//     h1: ({ node, ...props }) => (
//       <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2" {...props} />
//     ),
//     h2: ({ node, ...props }) => (
//       <h2
//         className="text-xl font-bold text-gray-800 mb-3 mt-6 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2"
//         {...props}
//       />
//     ),
//     h3: ({ node, ...props }) => (
//       <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4" {...props} />
//     ),
//     h4: ({ node, ...props }) => (
//       <h4 className="text-base font-semibold text-gray-700 mb-2 mt-3" {...props} />
//     ),
//     p: ({ node, ...props }) => (
//       <p className="text-gray-700 mb-3 leading-relaxed" {...props} />
//     ),
//     ul: ({ node, ...props }) => (
//       <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700" {...props} />
//     ),
//     ol: ({ node, ...props }) => (
//       <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700" {...props} />
//     ),
//     li: ({ node, ...props }) => <li className="ml-2" {...props} />,
//     strong: ({ node, ...props }) => (
//       <strong className="font-bold text-gray-900" {...props} />
//     ),
//     em: ({ node, ...props }) => <em className="italic text-blue-700" {...props} />,
//     blockquote: ({ node, ...props }) => (
//       <blockquote
//         className="border-l-4 border-blue-300 pl-4 py-2 bg-blue-50 text-gray-700 italic mb-4"
//         {...props}
//       />
//     ),
//     code: ({ inline, ...props }) =>
//       inline ? (
//         <code
//           className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600"
//           {...props}
//         />
//       ) : (
//         <code
//           className="block bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4"
//           {...props}
//         />
//       ),
//     pre: ({ node, ...props }) => <pre className="mb-4" {...props} />,
//     table: ({ node, ...props }) => (
//       <table className="min-w-full border border-gray-300 mb-4" {...props} />
//     ),
//     thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
//     th: ({ node, ...props }) => (
//       <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props} />
//     ),
//     td: ({ node, ...props }) => (
//       <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
//     ),
//     hr: ({ node, ...props }) => <hr className="my-6 border-gray-300" {...props} />,
//     a: ({ node, ...props }) => (
//       <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
//     ),
//   };

//   return (
//     <div className="w-full h-full bg-gray-50 border-l border-gray-200 shadow-lg flex flex-col">
//       {/* Header */}
//       <div className="p-6 border-b bg-white">
//         <div className="flex items-center justify-between mb-4">
//           <button
//             onClick={onBack}
//             className="flex items-center text-gray-600 hover:text-gray-900 transition"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Quay lại
//           </button>

//           <div className="flex space-x-2">
//             <button
//               onClick={() => onEdit(note.id)}
//               className="p-2 text-gray-400 hover:text-blue-600 transition rounded-md hover:bg-blue-50"
//             >
//               <Edit3 className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => onDelete(note.id)}
//               className="p-2 text-gray-400 hover:text-red-600 transition rounded-md hover:bg-red-50"
//             >
//               <Trash2 className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         {/* Title */}
//         <h1 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
//           <span className="mr-3 text-2xl">{getTypeIcon(note.type)}</span>
//           {note.title}
//         </h1>

//         {/* Metadata */}
//         <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//           <div className="flex items-center">
//             <Tag className="h-4 w-4 mr-1" />
//             {getTypeLabel(note.type)}
//           </div>

//           <div className="flex items-center">
//             <Clock className="h-4 w-4 mr-1" />
//             {formatDate(note.createdAt)}
//           </div>

//           {note.isGenerated && (
//             <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
//               🤖 AI tạo
//             </span>
//           )}

//           {note.updatedAt && (
//             <span className="text-orange-600 text-xs">
//               Cập nhật: {formatDate(note.updatedAt)}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Content */}
//       <div className="flex-1 overflow-y-auto p-6">
//         <div className="prose prose-lg max-w-none">
//           <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
//             <ReactMarkdown
//               remarkPlugins={[remarkGfm]}
//               components={mdComponents}
//               className="markdown-content"
//             >
//               {note.content}
//             </ReactMarkdown>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t bg-gray-50">
//         <div className="text-xs text-gray-500 text-center">
//           📝 {note.content.length} ký tự • {note.content.split("\n").length} dòng
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NoteDetail;

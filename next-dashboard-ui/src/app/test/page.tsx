"use client";
import { useState } from "react";

export default function TestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/extract-quiz', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Không thể kết nối đến server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test API Trích xuất câu hỏi</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <button
          onClick={handleFileUpload}
          disabled={!file || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {loading ? 'Đang xử lý...' : 'Upload và trích xuất'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Kết quả:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

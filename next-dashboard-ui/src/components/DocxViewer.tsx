import { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

export function DocxViewer({ file }: { file: File }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file && containerRef.current) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result && typeof e.target.result !== "string") {
          await renderAsync(e.target.result, containerRef.current!);
          // Đảm bảo nội dung không tràn ngang và scale nhỏ lại
          if (containerRef.current) {
            containerRef.current.querySelectorAll("*").forEach(el => {
              (el as HTMLElement).style.maxWidth = "100%";
              (el as HTMLElement).style.boxSizing = "border-box";
              (el as HTMLElement).style.wordBreak = "break-word";
            });
            // Scale toàn bộ nội dung
            containerRef.current.style.transform = "scale(0.7)";
            containerRef.current.style.transformOrigin = "top left";
            containerRef.current.style.width = "200%"; // Để tránh bị cắt ngang khi scale nhỏ
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  return (
    <div
      ref={containerRef}
      className="docx-preview bg-white p-4 w-full"
      style={{
        minHeight: 600,
        height: "70vh",
        width: "100%",
        overflowX: "auto",
        maxWidth: "100%"
      }}
    />
  );
}
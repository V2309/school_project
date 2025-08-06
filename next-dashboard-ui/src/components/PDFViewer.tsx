"use client";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

interface PDFViewerProps {
  fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
  return (
    <div className="border rounded p-2 h-[400px] lg:h-[600px] bg-white">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={fileUrl} />
      </Worker>
    </div>
  );
}

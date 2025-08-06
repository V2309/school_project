import React from "react";

interface GoogleDocxViewerProps {
  fileUrl: string; // URL công khai của file DOCX
}

export function GoogleDocxViewer({ fileUrl }: GoogleDocxViewerProps) {
  const encodedUrl = encodeURIComponent(fileUrl);

  return (
    <div className="w-full h-[70vh]">
      <iframe
        title="Google Docs Viewer"
        src={`https://docs.google.com/gview?url=${encodedUrl}&embedded=true`}
        width="100%"
        height="100%"
        style={{ border: "none" }}
      ></iframe>
    </div>
  );
}

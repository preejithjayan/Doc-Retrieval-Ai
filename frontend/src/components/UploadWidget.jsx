import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import documentService from '../services/documentService';

export default function UploadWidget({ onUploaded }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Ready to accept PDF, DOCX, TXT, and supported image uploads.');

  const uploadFile = async (file) => {
    if (!file) return;
    setMessage(`Uploading ${file.name}...`);
    setProgress(0);
    const { data } = await documentService.upload(file, (event) => {
      const ratio = Math.round((event.loaded * 100) / (event.total || file.size));
      setProgress(ratio);
    });
    setMessage(`${file.name} uploaded successfully.`);
    onUploaded?.(data.document);
  };

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-console-border bg-slate-50 px-5 py-4">
        <p className="text-sm font-semibold text-console-text">Upload documents</p>
        <p className="mt-1 text-xs text-console-muted">Place files into the ingestion queue for OCR, chunking, and embedding.</p>
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (event) => {
          event.preventDefault();
          setIsDragging(false);
          await uploadFile(event.dataTransfer.files?.[0]);
        }}
        className={`m-5 rounded-lg border-2 border-dashed p-6 ${isDragging ? 'border-console-blue bg-blue-50' : 'border-console-border bg-[#fafbfc]'}`}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={(event) => uploadFile(event.target.files?.[0])} />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-console-dark p-3 text-white">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-console-text">Drag and drop or browse files</h3>
              <p className="mt-1 max-w-xl text-sm text-console-muted">{message}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-console-muted">
                <span className="rounded-full border border-console-border bg-white px-3 py-1">PDF</span>
                <span className="rounded-full border border-console-border bg-white px-3 py-1">DOCX</span>
                <span className="rounded-full border border-console-border bg-white px-3 py-1">TXT</span>
                <span className="rounded-full border border-console-border bg-white px-3 py-1">PNG/JPG/TIFF</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="console-button-primary px-4 py-2 text-sm font-semibold"
          >
            Select file
          </button>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-console-muted">
            <span>Transfer progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-console-blue" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}


import { UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

import Button from '../ui/Button';
import Modal from '../ui/Modal';

export default function UploadModal({ isOpen, onClose, onSubmit, isSubmitting, progress }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);

  const handleSelect = (nextFile) => {
    setFile(nextFile ?? null);
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan/70">Upload Document</p>
            <h3 className="mt-3 font-display text-2xl font-semibold">Drop in the next file for indexing.</h3>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 flex w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-cyan/25 bg-cyan/5 px-6 py-12 text-center transition hover:border-cyan/40 hover:bg-cyan/10"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleSelect(event.dataTransfer.files?.[0]);
          }}
        >
          <UploadCloud className="h-10 w-10 text-cyan" />
          <p className="mt-4 font-display text-xl font-semibold">{file?.name || 'Drag and drop a PDF, image, DOCX, or TXT'}</p>
          <p className="mt-2 text-sm text-slate-400">Maximum size: 25 MB</p>
        </button>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.docx,.txt"
          onChange={(event) => handleSelect(event.target.files?.[0])}
        />

        <div className="mt-6 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan to-violet transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!file || isSubmitting} onClick={() => onSubmit(file)}>
            {isSubmitting ? 'Uploading...' : 'Upload and Process'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

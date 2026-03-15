import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileUp, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { documentsApi } from '../../lib/api/documents';
import Modal from '../ui/Modal';

const schema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, 'Select a file to upload.')
    .refine((file) => file?.size <= 25 * 1024 * 1024, 'Maximum file size is 25MB.'),
});

export default function UploadDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const {
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { file: null },
  });

  const file = watch('file');

  const mutation = useMutation({
    mutationFn: async ({ file }) => {
      const uploadResponse = await documentsApi.upload(file, (event) => {
        const ratio = Math.round((event.loaded * 100) / (event.total || file.size));
        setProgress(ratio);
      });
      await documentsApi.process(uploadResponse.data.document.id);
      return uploadResponse.data.document;
    },
    onSuccess: () => {
      toast.success('Document uploaded and queued for processing.');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      setProgress(0);
      reset();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.errors?.file_path?.[0] || 'Unable to upload this file.');
      setProgress(0);
    },
  });

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;
    setValue('file', selectedFile, { shouldValidate: true });
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload document" description="Drop a file into the ingestion pipeline. The API will upload the file and immediately enqueue processing.">
      <form className="space-y-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            selectFile(event.dataTransfer.files?.[0]);
          }}
          className="rounded-[28px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-8"
        >
          <input ref={inputRef} type="file" className="hidden" onChange={(event) => selectFile(event.target.files?.[0])} />
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-primary)]/12 text-[var(--accent-primary)]">
              <FileUp size={24} />
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--text-primary)]">Drop PDF or image documents here</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Supported formats include PDF, DOCX, TXT, PNG, JPG, TIFF, and scanned images.</p>
            </div>
            <button type="button" onClick={() => inputRef.current?.click()} className="secondary-button px-4 py-2 text-sm font-semibold">
              Browse files
            </button>
            {file ? <p className="font-mono text-xs text-[var(--text-muted)]">Selected: {file.name}</p> : null}
            {errors.file ? <p className="form-error">{errors.file.message}</p> : null}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Transfer progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
            <div className="h-full rounded-full bg-[var(--accent-primary)] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => { reset(); setProgress(0); onClose(); }} className="secondary-button px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="primary-button inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-60">
            {mutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : null}
            {mutation.isPending ? 'Uploading...' : 'Upload and process'}
          </button>
        </div>
      </form>
    </Modal>
  );
}


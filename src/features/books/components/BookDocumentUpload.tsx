import { useRef, useState } from 'react';
import { FileUp, Loader2, X } from 'lucide-react';
import { importPdfFile } from '@/lib/pdfImportHelpers';
import type { BookWithStructure } from '../types';
import { cn } from '@/lib/utils';

interface BookDocumentUploadProps {
  onImported: (book: BookWithStructure) => void;
}

export function BookDocumentUpload({ onImported }: BookDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function processFile(f: File) {
    if (f.type !== 'application/pdf') {
      setError('Please upload a PDF document.');
      return;
    }
    setFile(f);
    setError(null);
    setIsProcessing(true);

    try {
      const book = await importPdfFile(f);
      onImported(book);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not process this PDF. It may be encrypted or scanned.'
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) void processFile(f);
  }

  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white overflow-hidden">
      <div className="border-b border-[#E5E1D8] px-5 py-3.5">
        <h3 className="text-[13px] font-semibold text-[#0B1B2B]">Import from Document</h3>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">
          Upload a PDF to auto-fill title, chapters, and content — then review and publish.
        </p>
      </div>

      <div className="px-5 py-5">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void processFile(f);
            e.target.value = '';
          }}
        />

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors',
            isProcessing
              ? 'border-[#C9A646]/40 bg-[#C9A646]/5'
              : 'border-[#E5E1D8] bg-[#F7F6F2]/50 hover:border-[#C9A646]/40 hover:bg-[#C9A646]/5'
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 size={28} className="animate-spin text-[#C9A646] mb-3" />
              <p className="text-[14px] font-medium text-[#0B1B2B]">Processing document…</p>
              <p className="mt-1 text-[12px] text-[#94A3B8]">
                Extracting text, chapters, and metadata
              </p>
            </>
          ) : (
            <>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A646]/15">
                <FileUp size={22} className="text-[#C9A646]" />
              </div>
              <p className="text-[14px] font-medium text-[#0B1B2B]">
                Upload PDF Manuscript
              </p>
              <p className="mt-1 text-[12px] text-[#94A3B8] text-center max-w-xs">
                Drag & drop your PDF here, or browse from your computer
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0B1B2B] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#162A42]"
              >
                <FileUp size={14} />
                Choose PDF File
              </button>
            </>
          )}
        </div>

        {file && !isProcessing && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] px-3 py-2">
            <span className="flex-1 truncate text-[13px] text-[#0B1B2B]">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-[#94A3B8] hover:text-[#0B1B2B]"
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-[13px] text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

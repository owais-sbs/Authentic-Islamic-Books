import { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface SelectedFile {
  name: string;
  sizeMB: string;
}

interface BookImportDropzoneProps {
  file: SelectedFile | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

function formatSize(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function BookImportDropzone({ file, onFileSelect, onFileRemove }: BookImportDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') onFileSelect(f);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  }

  if (file) {
    return (
      <div className="flex items-start gap-4 rounded-xl border border-[#E5E1D8] bg-white p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50">
          <FileText size={22} className="text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#0B1B2B] truncate">{file.name}</p>
          <p className="mt-0.5 text-[13px] text-[#64748B]">{file.sizeMB} · PDF Document</p>
        </div>
        <button
          type="button"
          onClick={onFileRemove}
          className="shrink-0 rounded-md p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F7F6F2] hover:text-[#0B1B2B]"
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5E1D8] bg-[#F7F6F2] px-8 py-16 text-center transition-colors hover:border-[#C9A646]/40 hover:bg-[#F5F4EF] cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A646]/10 mb-5">
        <Upload size={28} className="text-[#C9A646]" />
      </div>
      <p className="text-[15px] font-semibold text-[#0B1B2B]">Drag &amp; drop your PDF here</p>
      <p className="mt-1 text-[13px] text-[#94A3B8]">or click to browse</p>
      <p className="mt-4 text-[12px] text-[#CBD5E1]">Supported format: PDF · Max size: 100 MB</p>
      <button
        type="button"
        className="mt-5 rounded-lg border border-[#E5E1D8] bg-white px-5 py-2 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-white hover:border-[#C9A646]/40"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
      >
        Choose PDF
      </button>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleChange} />
    </div>
  );
}

export { formatSize };

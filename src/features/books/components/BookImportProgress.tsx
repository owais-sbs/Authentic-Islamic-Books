import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';

export interface ImportStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

interface BookImportProgressProps {
  steps: ImportStep[];
  documentType?: 'text' | 'scanned' | 'mixed' | null;
  errorMessage?: string;
  /** Live detail e.g. "Page 250 / 1000" */
  detailMessage?: string;
  percent?: number;
}

function StepIcon({ status }: { status: ImportStep['status'] }) {
  if (status === 'done')
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
        <Check size={13} className="text-emerald-600" strokeWidth={2.5} />
      </span>
    );
  if (status === 'active')
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A646]/10">
        <Loader2 size={13} className="text-[#C9A646] animate-spin" />
      </span>
    );
  if (status === 'error')
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
        <AlertCircle size={13} className="text-red-500" />
      </span>
    );
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#E5E1D8]">
      <Circle size={7} className="text-[#CBD5E1]" fill="currentColor" />
    </span>
  );
}

export function BookImportProgress({
  steps,
  documentType,
  errorMessage,
  detailMessage,
  percent,
}: BookImportProgressProps) {
  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-[#0B1B2B]">Processing</h3>
        {documentType && (
          <span className="rounded-full border border-[#E5E1D8] bg-[#F7F6F2] px-2.5 py-0.5 text-[11px] font-medium text-[#64748B]">
            {documentType === 'scanned'
              ? 'Scanned PDF — OCR needed'
              : documentType === 'mixed'
                ? 'Mixed PDF'
                : 'Text PDF'}
          </span>
        )}
      </div>

      {(detailMessage || percent != null) && (
        <div className="mb-4 rounded-lg border border-[#E5E1D8] bg-[#FAFAF8] px-3 py-2.5">
          {detailMessage && (
            <p className="text-[13px] font-medium text-[#0B1B2B]">{detailMessage}</p>
          )}
          {percent != null && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E1D8]">
                <div
                  className="h-full rounded-full bg-[#C9A646] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[#64748B] tabular-nums">{Math.round(percent)}%</p>
            </div>
          )}
        </div>
      )}

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <StepIcon status={step.status} />
              {i < steps.length - 1 && (
                <div
                  className={`mt-1 h-5 w-0.5 rounded-full transition-colors ${
                    step.status === 'done' ? 'bg-emerald-200' : 'bg-[#E5E1D8]'
                  }`}
                />
              )}
            </div>
            <span
              className={`text-[13px] ${
                step.status === 'active'
                  ? 'font-medium text-[#0B1B2B]'
                  : step.status === 'done'
                  ? 'text-[#64748B]'
                  : step.status === 'error'
                  ? 'font-medium text-red-600'
                  : 'text-[#94A3B8]'
              }`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-600">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

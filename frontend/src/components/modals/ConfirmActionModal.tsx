'use client';

import { useEffect } from 'react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  icon: string;
  /** Primary warning message */
  message: string;
  /** Optional secondary details (e.g. pause reason) */
  detail?: string;
  /** Bullet-point consequences */
  consequences: string[];
  confirmLabel: string;
  cancelLabel?: string;
  /** 'danger' = red confirm button, 'warning' = amber */
  variant?: 'danger' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmActionModal({
  isOpen,
  title,
  icon,
  message,
  detail,
  consequences,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'warning',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] p-8"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div className="bg-white rounded-3xl max-w-[500px] w-full shadow-xl animate-fade-in">
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="text-2xl font-extrabold text-gray-900 mb-2">
            {icon} {title}
          </div>
          <div className="text-sm text-slate-600 leading-relaxed">
            {message}
          </div>
        </div>

        {/* Detail (pause reason etc.) */}
        {detail && (
          <div className="px-8 pb-4">
            <div className={`p-4 rounded-xl text-sm ${isDanger ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className={`font-semibold mb-1 ${isDanger ? 'text-red-800' : 'text-amber-800'}`}>
                Reason it was paused:
              </div>
              <div className={isDanger ? 'text-red-700' : 'text-amber-700'}>
                {detail}
              </div>
            </div>
          </div>
        )}

        {/* Consequences */}
        {consequences.length > 0 && (
          <div className="px-8 pb-6">
            <div className="text-sm font-bold text-slate-700 mb-2">
              What will happen:
            </div>
            <ul className="text-sm text-slate-600 leading-loose pl-5 m-0 list-disc">
              {consequences.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="py-6 px-8 border-t border-slate-200 flex gap-4 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="py-3 px-6 rounded-xl border-2 border-slate-200 bg-white text-slate-600 text-sm font-semibold cursor-pointer transition-colors hover:bg-slate-50"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="py-3 px-6 rounded-xl text-white text-sm font-semibold cursor-pointer transition-colors"
            style={{
              background: loading ? '#9CA3AF' : isDanger ? '#EF4444' : '#F59E0B',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

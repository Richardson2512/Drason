'use client';

import { useEffect } from 'react';

interface Finding {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  entity: string;
  entityName: string;
}

interface AssessmentConfirmationModalProps {
  isOpen: boolean;
  findings: Finding[];
  onConfirm: () => void;
  onReview: () => void;
  onCancel?: () => void;
}

export default function AssessmentConfirmationModal({
  isOpen,
  findings,
  onConfirm,
  onReview,
  onCancel
}: AssessmentConfirmationModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCancel) onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const criticalFindings = findings.filter(f => f.severity === 'critical');
  const warningFindings = findings.filter(f => f.severity === 'warning');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-8" style={{ background: 'rgba(0, 0, 0, 0.5)' }} role="dialog" aria-modal="true" aria-labelledby="assessment-confirmation-modal-title">
      <div className="bg-white rounded-3xl max-w-[600px] w-full max-h-[80vh] overflow-auto shadow-xl">
        {/* Header */}
        <div className="p-8 border-b border-slate-100">
          <div id="assessment-confirmation-modal-title" className="text-2xl font-extrabold text-gray-900 mb-2">
            ⚠️ Infrastructure Assessment Complete
          </div>
          <div className="text-sm text-slate-500 leading-relaxed">
            We've detected infrastructure health issues that could damage your domain reputation.
          </div>
        </div>

        {/* Findings */}
        <div className="py-6 px-8">
          {criticalFindings.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3">
                🚨 Critical Issues ({criticalFindings.length})
              </div>
              <div className="flex flex-col gap-3">
                {criticalFindings.map((finding, i) => (
                  <div key={i} className="bg-red-50 border border-red-300 rounded-xl p-4 text-sm">
                    <div className="font-semibold text-red-800 mb-1">
                      {finding.title}
                    </div>
                    <div className="text-red-700 text-[0.8rem]">
                      {finding.entity}: {finding.entityName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {warningFindings.length > 0 && (
            <div>
              <div className="text-sm font-bold text-amber-600 uppercase tracking-wide mb-3">
                ⚠️ Warnings ({warningFindings.length})
              </div>
              <div className="flex flex-col gap-3">
                {warningFindings.slice(0, 3).map((finding, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm">
                    <div className="font-semibold text-amber-800 mb-1">
                      {finding.title}
                    </div>
                    <div className="text-amber-700 text-[0.8rem]">
                      {finding.entity}: {finding.entityName}
                    </div>
                  </div>
                ))}
                {warningFindings.length > 3 && (
                  <div className="text-[0.8rem] text-slate-500 text-center p-2">
                    + {warningFindings.length - 3} more warnings
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-slate-50 py-6 px-8 border-t border-slate-200">
          <div className="text-sm font-bold text-slate-800 mb-3">
            🛡️ Recommended Action
          </div>
          <div className="text-sm text-slate-600 leading-relaxed mb-4">
            To protect your domain reputation, we recommend immediately pausing affected campaigns
            in Smartlead until these issues are resolved. This prevents further reputation damage.
          </div>
          <ul className="text-sm text-slate-600 leading-loose pl-6 m-0">
            <li>Affected campaigns will be paused in Smartlead</li>
            <li>No new leads will be pushed to paused campaigns</li>
            <li>You can resume campaigns after fixing the issues</li>
            <li>All actions will be logged in your audit trail</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="py-6 px-8 border-t border-slate-200 flex gap-4 justify-end">
          <button
            onClick={onReview}
            className="btn-hover-ghost py-3 px-6 rounded-xl border-2 border-slate-200 bg-white text-slate-600 text-sm font-semibold cursor-pointer"
          >
            Let Me Review First
          </button>
          <button
            onClick={onConfirm}
            className="premium-btn py-3 px-6 text-sm font-semibold"
          >
            ✅ Pause Now (Recommended)
          </button>
        </div>
      </div>
    </div>
  );
}

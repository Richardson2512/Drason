'use client';

/**
 * AssessmentProgressFloater
 *
 * Bottom-right notification floater for the periodic infrastructure
 * assessment (DNS / DNSBL / mailbox-health scan). Replaces the legacy
 * full-screen blocking modal so the dashboard stays usable while the
 * assessment runs.
 *
 * States:
 *   - hidden:   no assessment in progress, no recent completion to surface
 *   - running:  assessment_running=true on the org row — spinner + label
 *   - complete: assessment just finished — green check, auto-dismiss after 8s
 *
 * Polling lives in DashboardShell; this component is presentational +
 * dismiss-only.
 */

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, X, ShieldCheck } from 'lucide-react';

interface AssessmentProgressFloaterProps {
    inProgress: boolean;
    justFinished: boolean;
}

export default function AssessmentProgressFloater({ inProgress, justFinished }: AssessmentProgressFloaterProps) {
    const [dismissedRun, setDismissedRun] = useState(false);
    const [dismissedComplete, setDismissedComplete] = useState(false);

    // Reset dismiss state when a new run starts so the floater shows again.
    useEffect(() => {
        if (inProgress) {
            setDismissedRun(false);
            setDismissedComplete(false);
        }
    }, [inProgress]);

    const showRunning = inProgress && !dismissedRun;
    const showComplete = !inProgress && justFinished && !dismissedComplete;

    if (!showRunning && !showComplete) return null;

    return (
        <div
            className="fixed bottom-4 right-4 w-[320px] bg-white rounded-xl shadow-lg z-[9998] overflow-hidden"
            style={{ border: '1px solid #D1CBC5' }}
            role="status"
            aria-live="polite"
        >
            <div
                className="px-3 py-2.5 flex items-start gap-2.5"
                style={{ background: showRunning ? '#F7F2EB' : '#F0FDF4' }}
            >
                <div className="shrink-0 mt-0.5">
                    {showRunning ? (
                        <Loader2 size={14} className="animate-spin text-gray-700" />
                    ) : (
                        <CheckCircle2 size={14} className="text-emerald-600" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                        <ShieldCheck size={11} className="text-gray-500" />
                        {showRunning ? 'Infrastructure check running' : 'Infrastructure check complete'}
                    </div>
                    <p className="m-0 mt-0.5 text-[10px] text-gray-600 leading-snug">
                        {showRunning
                            ? 'Verifying DNS records and blacklist status in the background. Sending continues normally.'
                            : 'DNS and blacklist status refreshed. Findings are on the Infrastructure page.'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => (showRunning ? setDismissedRun(true) : setDismissedComplete(true))}
                    className="shrink-0 text-gray-400 hover:text-gray-700 cursor-pointer bg-transparent border-none p-0.5"
                    aria-label="Dismiss"
                >
                    <X size={11} />
                </button>
            </div>
        </div>
    );
}

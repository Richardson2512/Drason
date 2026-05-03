'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import CustomizeWithAIModal from './CustomizeWithAIModal';
import { useIsAuthenticated } from '@/lib/auth-client';

interface TemplateActionsProps {
    subject: string;
    body: string;
    prompt: string;
    templateSlug: string;
    templateTitle: string;
    templateTone?: string;
}

type CopyTarget = 'subject' | 'body' | 'prompt' | 'full';

export default function TemplateActions({
    subject,
    body,
    prompt,
    templateSlug,
    templateTitle,
    templateTone,
}: TemplateActionsProps) {
    const [copied, setCopied] = useState<CopyTarget | null>(null);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const { isAuthenticated } = useIsAuthenticated();

    async function handleCopy(target: CopyTarget) {
        let text = '';
        switch (target) {
            case 'subject': text = subject; break;
            case 'body':    text = body; break;
            case 'prompt':  text = prompt; break;
            case 'full':    text = `Subject: ${subject}\n\n${body}`; break;
        }
        try {
            await navigator.clipboard.writeText(text);
            setCopied(target);
            setTimeout(() => setCopied(null), 1800);
        } catch {
            // Clipboard API blocked (e.g., insecure context) — silent fail.
        }
    }

    return (
        <div className="rounded-xl bg-white border border-[#D1CBC5] p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-wide text-[#6B5E4F] font-semibold">Use this template</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                <CopyButton
                    label="Copy subject"
                    target="subject"
                    activeCopied={copied}
                    onClick={handleCopy}
                />
                <CopyButton
                    label="Copy body"
                    target="body"
                    activeCopied={copied}
                    onClick={handleCopy}
                />
                <CopyButton
                    label="Copy AI prompt"
                    target="prompt"
                    activeCopied={copied}
                    onClick={handleCopy}
                />
                <CopyButton
                    label="Copy full email"
                    target="full"
                    activeCopied={copied}
                    onClick={handleCopy}
                />
            </div>

            <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-[#1E1E2F] text-white text-sm font-semibold hover:bg-[#2A2A3F] transition"
            >
                <Sparkles size={14} strokeWidth={2} />
                Customize with AI for your business
            </button>
            <p className="mt-2 text-xs text-[#6B5E4F] text-center">
                {isAuthenticated
                    ? 'Unlimited generations on your account.'
                    : '3 free generations a day. Sign up for unlimited.'}
            </p>

            <CustomizeWithAIModal
                open={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                templateSlug={templateSlug}
                templateTitle={templateTitle}
                defaultTone={templateTone}
            />
        </div>
    );
}

function CopyButton({
    label,
    target,
    activeCopied,
    onClick,
}: {
    label: string;
    target: CopyTarget;
    activeCopied: CopyTarget | null;
    onClick: (t: CopyTarget) => void;
}) {
    const isCopied = activeCopied === target;
    return (
        <button
            type="button"
            onClick={() => onClick(target)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition ${
                isCopied
                    ? 'bg-[#E8F4EC] border-[#1F6F3A] text-[#1F6F3A]'
                    : 'bg-white border-[#D1CBC5] text-[#1E1E2F] hover:border-[#1E1E2F]'
            }`}
            aria-label={label}
        >
            {isCopied ? <Check size={14} strokeWidth={2.25} /> : <Copy size={14} strokeWidth={2} />}
            {isCopied ? 'Copied' : label}
        </button>
    );
}

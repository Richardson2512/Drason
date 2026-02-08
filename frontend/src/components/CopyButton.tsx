
import { useState } from 'react';

interface CopyButtonProps {
    text: string;
    label?: string;
    className?: string;
}

export default function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`premium-btn transition-all duration-200 ${className}`}
            style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: copied ? '#10B981' : undefined,
                borderColor: copied ? '#10B981' : undefined,
                color: copied ? '#FFFFFF' : undefined,
                minWidth: '80px',
                textAlign: 'center'
            }}
        >
            {copied ? 'Copied!' : label}
        </button>
    );
}

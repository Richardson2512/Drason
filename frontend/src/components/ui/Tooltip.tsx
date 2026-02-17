'use client';
import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    content: string | React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export function Tooltip({ content, children, position = 'top', delay = 200 }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current && tooltipRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const tooltipRect = tooltipRef.current.getBoundingClientRect();

                let top = 0;
                let left = 0;

                switch (position) {
                    case 'top':
                        top = triggerRect.top - tooltipRect.height - 8;
                        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                        break;
                    case 'bottom':
                        top = triggerRect.bottom + 8;
                        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                        break;
                    case 'left':
                        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                        left = triggerRect.left - tooltipRect.width - 8;
                        break;
                    case 'right':
                        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                        left = triggerRect.right + 8;
                        break;
                }

                // Keep within viewport
                const padding = 8;
                if (left < padding) left = padding;
                if (left + tooltipRect.width > window.innerWidth - padding) {
                    left = window.innerWidth - tooltipRect.width - padding;
                }
                if (top < padding) top = triggerRect.bottom + 8;

                setCoords({ top, left });
                setIsVisible(true);
            }
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
            >
                {children}
            </div>
            {isVisible && (
                <div
                    ref={tooltipRef}
                    style={{
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        zIndex: 9999,
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.15s ease-out'
                    }}
                >
                    <div style={{
                        background: '#1E293B',
                        color: '#FFFFFF',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        lineHeight: '1.4',
                        maxWidth: '280px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {content}
                    </div>
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}

export function InfoIcon({ size = 14 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="currentColor"
            style={{ display: 'inline-block', marginLeft: '0.25rem' }}
        >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
    );
}

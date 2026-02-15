'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
    content: string | ReactNode;
    children?: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    maxWidth?: string;
    showIcon?: boolean;
    iconSize?: number;
}

/**
 * Tooltip Component
 *
 * Shows helpful information on hover. Use this for inline explanations
 * of complex concepts without cluttering the UI.
 *
 * @example
 * <Tooltip content="Infrastructure score measures DNS health at sync time">
 *   Infrastructure Score
 * </Tooltip>
 *
 * @example
 * <Tooltip content="Your bounce rate is below 5%" showIcon />
 */
export function Tooltip({
    content,
    children,
    position = 'top',
    maxWidth = '280px',
    showIcon = false,
    iconSize = 16
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [adjustedPosition, setAdjustedPosition] = useState(position);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible && tooltipRef.current && triggerRef.current) {
            const tooltip = tooltipRef.current;
            const trigger = triggerRef.current;
            const rect = trigger.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            // Check if tooltip overflows viewport
            let newPosition = position;

            if (position === 'top' && rect.top - tooltipRect.height < 0) {
                newPosition = 'bottom';
            } else if (position === 'bottom' && rect.bottom + tooltipRect.height > window.innerHeight) {
                newPosition = 'top';
            } else if (position === 'left' && rect.left - tooltipRect.width < 0) {
                newPosition = 'right';
            } else if (position === 'right' && rect.right + tooltipRect.width > window.innerWidth) {
                newPosition = 'left';
            }

            setAdjustedPosition(newPosition);
        }
    }, [isVisible, position]);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
    };

    return (
        <div className="relative inline-flex items-center">
            <div
                ref={triggerRef}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className="inline-flex items-center gap-1 cursor-help"
            >
                {children}
                {showIcon && (
                    <Info
                        size={iconSize}
                        className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                    />
                )}
            </div>

            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`
                        absolute z-50 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg
                        shadow-lg shadow-gray-900/30 pointer-events-none
                        animate-in fade-in-0 zoom-in-95 duration-200
                        ${positionClasses[adjustedPosition]}
                    `}
                    style={{ maxWidth }}
                >
                    {content}
                    <div
                        className={`
                            absolute w-0 h-0 border-4
                            ${arrowClasses[adjustedPosition]}
                        `}
                    />
                </div>
            )}
        </div>
    );
}

interface TooltipIconProps {
    content: string | ReactNode;
    size?: number;
    className?: string;
}

/**
 * TooltipIcon Component
 *
 * A standalone info icon with tooltip. Use this for adding help
 * to labels or headings without wrapping text.
 *
 * @example
 * <h2>Infrastructure Score <TooltipIcon content="Measures DNS health" /></h2>
 */
export function TooltipIcon({ content, size = 16, className = '' }: TooltipIconProps) {
    return (
        <Tooltip content={content} showIcon iconSize={size}>
            <span className={className}></span>
        </Tooltip>
    );
}

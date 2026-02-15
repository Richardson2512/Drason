'use client';

import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

interface HelpLinkProps {
    href: string;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * HelpLink Component
 *
 * A contextual help link that opens documentation in a new tab.
 * Use this throughout the dashboard to link to relevant docs.
 *
 * @example
 * <HelpLink href="/docs/infrastructure-assessment" label="Learn about infrastructure scores" />
 */
export function HelpLink({ href, label, size = 'md', className = '' }: HelpLinkProps) {
    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    const iconSizes = {
        sm: 14,
        md: 16,
        lg: 20
    };

    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700
                hover:underline transition-colors font-medium
                ${sizeClasses[size]} ${className}
            `}
        >
            <HelpCircle size={iconSizes[size]} />
            {label && <span>{label}</span>}
        </Link>
    );
}

interface HelpIconProps {
    href: string;
    size?: number;
    className?: string;
}

/**
 * HelpIcon Component
 *
 * A minimal help icon that links to documentation.
 * Use this for inline help without taking up much space.
 *
 * @example
 * <HelpIcon href="/docs/monitoring" />
 */
export function HelpIcon({ href, size = 16, className = '' }: HelpIconProps) {
    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                inline-flex items-center justify-center
                text-gray-400 hover:text-blue-600 transition-colors
                ${className}
            `}
            title="Learn more in documentation"
        >
            <HelpCircle size={size} />
        </Link>
    );
}

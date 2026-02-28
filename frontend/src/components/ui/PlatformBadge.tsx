const PLATFORM_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    smartlead: { label: 'Smartlead', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    emailbison: { label: 'EmailBison', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    instantly: { label: 'Instantly', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
    replyio: { label: 'Reply.io', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

export function PlatformBadge({ platform }: { platform: string }) {
    const config = PLATFORM_CONFIG[platform] || { label: platform, color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };
    return (
        <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: config.color,
            background: config.bg,
            border: `1px solid ${config.border}`,
            padding: '1px 6px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
        }}>
            {config.label}
        </span>
    );
}

export function getPlatformLabel(platform: string | null | undefined): string {
    if (!platform) return 'your email platform';
    return PLATFORM_CONFIG[platform]?.label || platform;
}

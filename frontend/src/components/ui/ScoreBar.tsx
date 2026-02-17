/**
 * ScoreBar Component
 *
 * Visual progress bar showing score breakdown with label and value
 */

interface ScoreBarProps {
    label: string;
    value: number;
    max: number;
    color?: string;
}

export function ScoreBar({ label, value, max, color = '#3B82F6' }: ScoreBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>{label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
                    {value}<span style={{ color: '#9CA3AF', fontWeight: 400 }}>/{max}</span>
                </span>
            </div>
            <div style={{
                background: '#E2E8F0',
                borderRadius: '999px',
                height: '8px',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: `linear-gradient(90deg, ${color} 0%, ${color}DD 100%)`,
                    width: `${percentage}%`,
                    height: '100%',
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '999px'
                }} />
            </div>
        </div>
    );
}

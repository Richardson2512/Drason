/**
 * StatBadge Component
 *
 * Small card showing icon, label, and value for stats display
 */

interface StatBadgeProps {
    icon: string;
    label: string;
    value: string | number;
}

export function StatBadge({ icon, label, value }: StatBadgeProps) {
    return (
        <div style={{
            background: 'white',
            padding: '0.75rem',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            transition: 'all 0.2s',
            cursor: 'default'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#BFDBFE';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem', fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>{value}</div>
        </div>
    );
}

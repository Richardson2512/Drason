'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import SemiCircleGauge from './SemiCircleGauge';

interface LeadHealthData {
    total: number;
    green: number;
    yellow: number;
    red: number;
    blocked: number;
    greenPercent: number;
    yellowPercent: number;
    redPercent: number;
}

export default function LeadHealthChart() {
    const [data, setData] = useState<LeadHealthData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient<LeadHealthData>('/api/dashboard/lead-health-stats')
            .then(setData)
            .catch(err => console.error('[LeadHealthChart] Failed to fetch health stats', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="premium-card" style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Loading health classifications...
            </div>
        );
    }

    if (!data || data.total === 0) return null;

    const chartData = [
        { name: 'Green', value: data.green, color: '#22c55e' },
        { name: 'Yellow', value: data.yellow, color: '#eab308' },
        { name: 'Red', value: data.red, color: '#ef4444' },
    ];

    return (
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1.5rem', paddingBottom: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>Lead Health Gate</h2>
                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Health classification breakdown</p>
            </div>

            <SemiCircleGauge
                data={chartData}
                centerValue={data.total}
                centerLabel="Total"
            />
        </div>
    );
}

'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';

interface ScoreGaugeProps {
    score: number;
    scoreColor: string;
}

export function ScoreGauge({ score, scoreColor }: ScoreGaugeProps) {
    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
                <Pie
                    data={[
                        { value: score },
                        { value: 100 - score }
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={65} outerRadius={85}
                    startAngle={90} endAngle={-270}
                    paddingAngle={0} dataKey="value"
                    cornerRadius={8} strokeWidth={0}
                >
                    <Cell fill={scoreColor} />
                    <Cell fill="#F3F4F6" />
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
}

interface FindingsChartProps {
    data: Array<{ name: string; value: number; color: string }>;
}

export function FindingsChart({ data }: FindingsChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={75}
                    paddingAngle={5} dataKey="value"
                    cornerRadius={6} strokeWidth={0}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

interface ScoreHistoryProps {
    data: Array<{ date: string; score: number }>;
}

export function ScoreHistory({ data }: ScoreHistoryProps) {
    if (!data || data.length === 0) return null;

    const getColor = (score: number) => {
        if (score >= 80) return '#16A34A';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const latestColor = getColor(data[data.length - 1]?.score || 0);

    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={latestColor} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={latestColor} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{
                        background: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontSize: '0.8rem',
                    }}
                    formatter={(value: any) => [`${value}/100`, 'Score']}
                    labelFormatter={(label: any) => `Assessment: ${label}`}
                />
                <Area
                    type="monotone"
                    dataKey="score"
                    stroke={latestColor}
                    strokeWidth={2.5}
                    fill="url(#scoreGradient)"
                    dot={{ r: 4, fill: latestColor, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: latestColor, strokeWidth: 2, stroke: '#fff' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

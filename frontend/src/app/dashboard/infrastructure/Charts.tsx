'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

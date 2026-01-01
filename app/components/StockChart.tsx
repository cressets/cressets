'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartProps {
    data: { date: string; close: number }[];
}

export default function StockChart({ data }: ChartProps) {
    // Determine color based on trend (First vs Last)
    const isUp = data.length > 1 && data[data.length - 1].close >= data[0].close;
    const strokeColor = isUp ? '#D60000' : '#0000D6'; // Red for up, Blue for down (KR standard)

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => val.toLocaleString()}
                    />
                    <Tooltip
                        contentStyle={{ border: '2px solid black', borderRadius: '0px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                        formatter={(value?: number) => [`${(value ?? 0).toLocaleString()} KRW`, 'Close']}
                    />
                    <Line
                        type="monotone"
                        dataKey="close"
                        stroke={strokeColor}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: strokeColor }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <style jsx>{`
        .chart-container {
            width: 100%;
            height: 400px;
            background: #fff;
            padding: 20px;
            border: 3px solid #000;
        }
      `}</style>
        </div>
    );
}

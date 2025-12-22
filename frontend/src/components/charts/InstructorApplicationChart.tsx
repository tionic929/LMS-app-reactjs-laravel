// InstructorApplicationChart.tsx
import React, { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { type InstructorAnalytics } from '../../api/instructorApplications';

interface InstructorApplicationChartProps {
    analytics: InstructorAnalytics | null;
}

const CustomTooltip = memo(({ active, payload, total }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
        return (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xl shadow-slate-300/50 pointer-events-none">
                <p className="text-[10px] font-extrabold text-slate-900 uppercase tracking-widest mb-2">{data.name} Status</p>
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-slate-900">{data.value.toLocaleString()}</span>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600">{percentage}%</span>
                </div>
            </div>
        );
    }
    return null;
});

const InstructorApplicationChart: React.FC<InstructorApplicationChartProps> = ({ analytics }) => {
    const chartData = useMemo(() => {
        if (!analytics) return [];
        return [
            { name: 'Approved', value: Number(analytics.totalApproved || 0), color: '#10b981' }, 
            { name: 'Pending', value: Number(analytics.totalPending || 0), color: '#f59e0b' },  
            { name: 'Rejected', value: Number(analytics.totalRejected || 0), color: '#ef4444' },
        ].filter(item => item.value > 0);
    }, [analytics]);

    const totalApplications = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

    if (!analytics || chartData.length === 0) return null;

    return (
        // Replaced semi-transparent classes with solid bg-white
        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 flex flex-col  h-full">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-1">Instructors Rate</h3>
                    <p className="text-slate-900 font-bold text-lg">Application Distribution</p>
                </div>
                <div className="rounded-2xl text-right">
                    <span className="text-5xl font-medium text-slate-900 leading-none">{totalApplications.toLocaleString()}</span>
                    <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest text-slate-400/60">Total</span>
                </div>
            </div>

            <div className="relative flex-1 min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <PieChart>
                        <Tooltip content={<CustomTooltip total={totalApplications} />} position={{ x: 70, y: 20 }} isAnimationActive={true} />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={8}
                            stroke="none"
                            animationDuration={400}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color} 
                                    className="outline-none hover:opacity-90 transition-opacity"
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Success</span>
                    <span className="text-4xl font-black text-slate-800 tracking-tighter">
                        {totalApplications > 0 ? ((Number(analytics.totalApproved || 0) / totalApplications) * 100).toFixed(0) : 0}%
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-4">
                {chartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default memo(InstructorApplicationChart);
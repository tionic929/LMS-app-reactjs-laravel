// RegistrationTrendLineChart.tsx
import React, { memo, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ChartDataItem {
  name: string;
  Learners: number; 
  Instructors: number; 
  [key: string]: string | number;
}

interface RegistrationTrendProps {
  data: ChartDataItem[];
  title: string;
  primaryDataKey: string;
  secondaryDataKey: string;
}

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xl shadow-slate-300/50  pointer-events-none">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-slate-700">{entry.name}</span>
              </div>
              <span className="text-xs font-black text-slate-900">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
});

const RegistrationTrendLineChart: React.FC<RegistrationTrendProps> = ({
  data,
  title,
  primaryDataKey,
  secondaryDataKey,
}) => {
  const chartMargin = useMemo(() => ({ top: 10, right: 10, left: -20, bottom: 0 }), []);
  const axisTickStyle = useMemo(() => ({ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }), []);

  return (
    // Replaced bg-slate-50/50 with solid bg-white and removed backdrop-blur
    <div className="group lg:col-span-2 bg-slate-100/10 hover:bg-white hover:border-white transition-all shadow-sm shadow-slate-200/60 p-8 rounded-[2rem] border border-slate-100 flex flex-col h-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-1 group-hover:text-slate-800 transition-all">{title}</h3>
          <p className="text-slate-900 font-bold text-lg group">Growth Analysis</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Learners</span>
          </div>
          {secondaryDataKey && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Instructors</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="8 8" />
            <XAxis dataKey="name" axisLine={false} tickLine={true} tick={axisTickStyle} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={axisTickStyle} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} isAnimationActive={true} />
            
            <Line 
              type="monotone" 
              dataKey={primaryDataKey} 
              stroke="#6366f1" 
              strokeWidth={4} 
              dot={false}
              activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }}
            />
            {secondaryDataKey && (
              <Line 
                type="monotone" 
                dataKey={secondaryDataKey} 
                stroke="#10b981" 
                strokeWidth={4} 
                
                dot={false}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(RegistrationTrendLineChart);
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string; // e.g., 'Week 1', 'Jan'
  activity: number; // e.g., Lessons Completed or Learners Active
}

interface CourseProgressChartProps {
  title: string;
  data: ChartData[];
  dataKey: keyof ChartData;
  label: string; // e.g., 'Lessons Completed', 'Active Learners'
}

const CourseProgressChart: React.FC<CourseProgressChartProps> = ({ title, data, dataKey, label }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis label={{ value: label, angle: -90, position: 'insideLeft', fill: '#6B7280' }} stroke="#6B7280" />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#374151', 
                    borderRadius: '0.5rem', 
                    border: 'none', 
                    color: 'white' 
                }}
                labelStyle={{ color: '#FCD34D' }}
            />
            <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="#F59E0B" // Amber color
                strokeWidth={2} 
                dot={{ fill: '#F59E0B', r: 4 }}
                activeDot={{ r: 8, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CourseProgressChart;
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { topCoursesData } from '../../data/mockAdminData'; 

const CoursePerformanceBarChart: React.FC = () => (
  <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">Top 5 Enrolled Courses</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topCoursesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="name" stroke="#374151" className="text-xs" angle={-15} textAnchor="end" height={50} />
        <YAxis yAxisId="left" stroke="#374151" />
        <YAxis yAxisId="right" orientation="right" stroke="#dc2626" label={{ value: 'Avg Score', angle: -90, position: 'insideRight' }}/>
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} 
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="Enrollment" fill="#1d4ed8" radius={[10, 10, 0, 0]} />
        <Bar yAxisId="right" dataKey="Score" fill="#dc2626" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default CoursePerformanceBarChart;
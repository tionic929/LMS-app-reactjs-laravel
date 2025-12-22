import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { enrollmentTrendData } from '../../data/mockAdminData';

const EnrollmentLineChart: React.FC = () => (
  <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Enrollment Trend</h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={enrollmentTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="name" stroke="#374151" />
        <YAxis stroke="#374151" />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} 
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend />
        <Line type="monotone" dataKey="Learners" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Instructors" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default EnrollmentLineChart;
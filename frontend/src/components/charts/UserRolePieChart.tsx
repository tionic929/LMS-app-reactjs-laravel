import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { userRoleData } from '../../data/mockAdminData'; 

// Custom label function from the original code
const renderRoleCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-xs">
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const UserRolePieChart: React.FC = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">User Role Distribution</h2>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={userRoleData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          labelLine={false}
          label={renderRoleCustomizedLabel}
        >
          {userRoleData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default UserRolePieChart;
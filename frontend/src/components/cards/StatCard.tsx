import React from 'react';

export interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-40 transition hover:shadow-2xl hover:scale-[1.02] duration-300">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <p className="text-xs text-gray-400 mt-2 truncate">{title}</p>
  </div>
);

export default StatCard;
import React from 'react';

interface MetricCardProps {
    icon: React.ElementType;
    title: string;
    value: string; 
    color: string; 
    cardColor?: string;
    cardClassName?: string; // Made optional as it has a default
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, color, cardColor, cardClassName = ''}) => {
    const textColorClass = color.replace('bg-', 'text-');
    
    return (
        // 1. cardClassName is applied to the outer div
        <div className={` p-6 rounded-xl shadow-md border border-white flex items-start justify-between ${cardClassName} ${cardColor} group-hover:bg-red-600`}>
            <div className="flex flex-col">
                <span className="text-sm font-medium  transition-colors duration-300 group-hover:text-white">{title}</span>
                {/* 3. Update text color to change on group hover (to white) */}
                <span className="text-5xl font-semibold  mt-1 transition-colors duration-300 group-hover:text-white">{value}</span>
                <span className="text-md mt-1 transition-colors duration-300 group-hover:text-white">{value}</span>
            </div>  
            <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                <Icon className={`w-8 h-8 ${textColorClass}`} />
            </div>
        </div>
    );
};

export default MetricCard;
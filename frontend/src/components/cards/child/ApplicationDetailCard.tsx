import React from 'react';

interface ApplicationDetailProps {
    id: number;
    userName: string;
    date: string; // The formatted created_at date
    type: 'Latest' | 'Oldest' | 'Random';
}

const ApplicationDetailCard: React.FC<ApplicationDetailProps> = ({ id, userName, date, type }) => {
    // Determine color based on type for visual distinction
    let badgeColor;
    if (type === 'Latest') badgeColor = 'bg-blue-500';
    else if (type === 'Oldest') badgeColor = 'bg-green-500';
    else badgeColor = 'bg-gray-500';

    return (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition duration-200">
            <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
                <span className={`text-xs text-white font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {type}
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Application ID: {id}</p>
            <p className="text-xs text-gray-400 mt-1">Filed on: {date}</p>
        </div>
    );
};

export default ApplicationDetailCard;
// components/AnnouncementCard.tsx (REVISED)

import React from 'react';
import { type Announcement } from '../../types/announcement';
import { FaTag, FaCalendarAlt } from 'react-icons/fa';

interface AnnouncementCardProps {
    announcement: Announcement;
    onViewDetail: (announcement: Announcement) => void;
}

// Helper for distinct category tags
const CategoryTag: React.FC<{ category: Announcement['category'] }> = ({ category }) => {
    let colorClass = 'bg-gray-100 text-gray-700';
    if (category === 'System') colorClass = 'bg-blue-100 text-blue-800';
    if (category === 'Feature') colorClass = 'bg-green-100 text-green-800';
    if (category === 'Maintenance') colorClass = 'bg-yellow-100 text-yellow-800';
    if (category === 'Security') colorClass = 'bg-red-100 text-red-800';

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded ${colorClass}`}>
            {category}
        </span>
    );
};

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, onViewDetail }) => {
    const formattedDate = new Date(announcement.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const isNew = announcement.isNew;
    
    return (
        <div 
            className={`flex flex-col p-5 bg-white rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer 
            ${isNew 
                ? 'border-l-4 border-l-red-500 bg-red-50' 
                : 'border border-gray-100'
            }`}
            onClick={() => onViewDetail(announcement)}
        >
            <div className="flex justify-between items-center mb-3">
                <CategoryTag category={announcement.category} />
                {isNew && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full animate-pulse">
                        NEW
                    </span>
                )}
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-2 line-clamp-2">
                {announcement.title}
            </h3>

            <p className={`text-sm mb-4 line-clamp-3 ${isNew ? 'text-gray-700' : 'text-gray-500'}`}>
                {announcement.content}
            </p>

            <div className="flex justify-between items-center text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
                <span className="flex items-center font-semibold">
                    <FaCalendarAlt className="w-3 h-3 mr-1" />
                    Published: {formattedDate}
                </span>
            </div>
        </div>
    );
};

export default AnnouncementCard;
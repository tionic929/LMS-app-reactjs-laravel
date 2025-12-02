import React from 'react';
import { FaUserPlus, FaGraduationCap, FaQuestionCircle } from 'react-icons/fa';
import { PiUsersThreeBold } from 'react-icons/pi';
import { RiFileList2Line } from 'react-icons/ri';

interface ActionItem {
  id: string | number;
  type: 'request' | 'submission' | 'discussion';
  courseTitle: string;
  details: string;
  link: string;
}

interface ActionRequiredListProps {
  items: ActionItem[];
}

const getIcon = (type: ActionItem['type']) => {
  switch (type) {
    case 'request':
      return <FaUserPlus className="h-6 w-6 text-blue-500" />;
    case 'submission':
      return <FaGraduationCap className="h-6 w-6 text-purple-500" />;
    case 'discussion':
      return <FaQuestionCircle className="h-6 w-6 text-orange-500" />;
    default:
      return <RiFileList2Line className="h-6 w-6 text-gray-500" />;
  }
};

const ActionRequiredList: React.FC<ActionRequiredListProps> = ({ items }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full">
      <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
        <RiFileList2Line className="h-6 w-6" />
        Action Required ({items.length})
      </h3>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">All clear! No pending actions.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition duration-150"
            >
              {getIcon(item.type)}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{item.details}</p>
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  <span className="font-medium text-red-600 capitalize">{item.type}</span> in: {item.courseTitle}
                </p>
              </div>
              <a
                href={item.link}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap"
              >
                View
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionRequiredList;
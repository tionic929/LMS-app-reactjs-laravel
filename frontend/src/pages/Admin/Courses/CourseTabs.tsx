import React from "react";
import { PiUsersThreeBold } from "react-icons/pi";
import { RiMegaphoneLine } from "react-icons/ri";
import { FaRegFileAlt, FaRegCommentDots } from "react-icons/fa";
import { VscRequestChanges } from "react-icons/vsc";

// Type for the active tab state
type ActiveTab = "learners" | "comments" | "announcements" | "requests" | "materials";

interface CourseTabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isInstructor: boolean;
  isPrivate: boolean;
  learnersCount: number;
  requestsCount: number;
  materialsCount: number;
  commentsCount: number;
  announcementsCount: number;
  children: React.ReactNode;
}

const CourseTabs: React.FC<CourseTabsProps> = ({
  activeTab,
  setActiveTab,
  isInstructor,
  isPrivate,
  learnersCount,
  requestsCount,
  materialsCount,
  commentsCount,
  announcementsCount,
  children,
}) => {
  const tabs = [
    { id: "learners", label: "Learners", icon: PiUsersThreeBold, count: learnersCount },
    ...(isInstructor && isPrivate ? [{ id: "requests", label: "Requests", icon: VscRequestChanges, count: requestsCount }] : []),
    { id: "materials", label: "Materials", icon: FaRegFileAlt, count: materialsCount },
    { id: "comments", label: "Comments", icon: FaRegCommentDots, count: commentsCount },
    { id: "announcements", label: "Announcements", icon: RiMegaphoneLine, count: announcementsCount },
  ];

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-4 textalign: center sm:px-6 lg:px-8">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-1 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export default CourseTabs;
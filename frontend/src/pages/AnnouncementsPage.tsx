import React from 'react';

const AnnouncementsPage: React.FC = () => {
  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Announcements</h1>

        <div className="space-y-4">
          {/* Sample announcement cards */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Our Learning Management System
                </h2>
                <p className="text-gray-600 mb-3">
                  We're excited to have you join our LMS platform. Here you'll find all the tools and resources you need for your learning journey.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Info
                  </span>
                  <span className="ml-4">Posted on November 24, 2025</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  System Maintenance Scheduled
                </h2>
                <p className="text-gray-600 mb-3">
                  The system will be undergoing maintenance this weekend. Please save your work and log out before the scheduled time.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Warning
                  </span>
                  <span className="ml-4">Posted on November 24, 2025</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  New Course Available
                </h2>
                <p className="text-gray-600 mb-3">
                  We've added a new advanced React development course. Enroll now to enhance your skills!
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Success
                  </span>
                  <span className="ml-4">Posted on November 24, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AnnouncementsPage;
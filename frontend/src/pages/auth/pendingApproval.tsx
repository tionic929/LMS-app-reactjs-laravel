// src/pages/PendingApproval.tsx
import { HomeIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const PendingApproval: React.FC = () => {
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Pending</h1>
      <p className="text-gray-600 text-center max-w-md">
        Your instructor application is still under review. You cannot access the dashboard until it is approved.
      </p>
      <p className="mt-4 text-center text-sm text-gray-600">
        <Link
            to="/ "
            className="flex items-center align-center justify-center px-5 py-3 text-md font-medium text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition duration-150"
        >
            <HomeIcon className="w-6 h-6 mr-3" />
            Go back to home
        </Link>
      </p>
    </div>
  );
};

export default PendingApproval;

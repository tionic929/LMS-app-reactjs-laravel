// src/pages/PendingApproval.tsx
import React from "react";

const PendingApproval: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Pending</h1>
      <p className="text-gray-600 text-center max-w-md">
        Your instructor application is still under review. You cannot access the dashboard until it is approved.
      </p>
    </div>
  );
};

export default PendingApproval;

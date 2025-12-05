import React from "react";

interface CommentSkeletonProps {
  count?: number;
}

const CommentSkeleton: React.FC<CommentSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-gray-100 pb-6">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentSkeleton;
import React from "react";

const CourseSkeleton: React.FC = () => {
  return (
    <main className="flex-1 overflow-auto">
      {/* Course Header Skeleton */}
      <div className="bg-purple-500 text-white">
        <div className="px-6 py-4">
          {/* Back Button Skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-5 bg-purple-400 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-purple-400 rounded animate-pulse"></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-4">
              <div className="h-10 w-10 bg-purple-400 rounded animate-pulse"></div>
              <div>
                <div className="h-6 w-64 bg-purple-400 rounded animate-pulse mb-2"></div>
                <div className="flex items-center gap-4">
                  <div className="h-5 w-16 bg-purple-600 rounded-full animate-pulse"></div>
                  <div className="h-4 w-24 bg-purple-400 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              
              <div className="h-8 w-40 bg-red-400 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Skeleton */}
      <div className="px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Tabs Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <div className="flex w-full">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-3">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Content Skeleton */}
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {/* <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div> */}
                      <div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CourseSkeleton;
import React from 'react';

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-white py-10">
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>

        {/* Images skeleton */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-xl overflow-hidden mb-8">
          <div className="col-span-2 row-span-2 bg-gray-200"></div>
          <div className="col-span-1 row-span-1 bg-gray-200"></div>
          <div className="col-span-1 row-span-1 bg-gray-200"></div>
          <div className="col-span-1 row-span-1 bg-gray-200"></div>
          <div className="col-span-1 row-span-1 bg-gray-200"></div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default React.memo(LoadingSkeleton);
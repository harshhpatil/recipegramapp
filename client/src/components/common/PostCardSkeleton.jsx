const PostCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>

      {/* Image skeleton */}
      <div className="w-full h-96 bg-gray-300"></div>

      {/* Content skeleton */}
      <div className="p-4">
        <div className="flex gap-4 mb-3">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;

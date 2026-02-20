const PostCardSkeleton = () => {
  return (
    <div className="card overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-11 h-11 bg-warmGray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-warmGray-200 rounded w-28 mb-2"></div>
          <div className="h-3 bg-warmGray-100 rounded w-20"></div>
        </div>
      </div>

      {/* Image skeleton */}
      <div className="w-full h-96 bg-linear-to-br from-warmGray-200 to-warmGray-100"></div>

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Action buttons skeleton */}
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-warmGray-200 rounded-lg"></div>
          <div className="w-10 h-10 bg-warmGray-200 rounded-lg"></div>
        </div>
        
        {/* Likes count skeleton */}
        <div className="h-4 bg-warmGray-200 rounded w-24"></div>
        
        {/* Caption skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-warmGray-200 rounded w-full"></div>
          <div className="h-4 bg-warmGray-100 rounded w-3/4"></div>
        </div>
        
        {/* Comments link skeleton */}
        <div className="h-3 bg-warmGray-100 rounded w-32"></div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;

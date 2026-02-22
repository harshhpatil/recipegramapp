const Loading = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-cream-300 border-t-primary-500 rounded-full animate-spin`}></div>
      {text && <p className="mt-4 text-warmGray-600">{text}</p>}
    </div>
  );
};

export default Loading;

import { formatDistanceToNow } from '../../utils/helpers';

const MessageItem = ({ message, isOwn, onReply, isLastOwn }) => {
  const showSeen = isOwn && isLastOwn && message.isRead;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-xs lg:max-w-md xxl:max-w-lg px-4 py-2 rounded-3xl ${
            isOwn
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-cream-200 text-warmGray-900 rounded-bl-md border border-cream-300'
          } break-words`}
        >
          {message.parentMessage && (
            <div
              className={`mb-2 px-2 py-1 rounded-lg text-xs border ${
                isOwn
                  ? 'bg-primary-600 border-primary-400 text-primary-50'
                  : 'bg-cream-100 border-cream-300 text-warmGray-600'
              }`}
            >
              <span className="font-semibold">
                Replying to {message.parentMessage.sender?.username || 'message'}
              </span>
              <div className="truncate">{message.parentMessage.content}</div>
            </div>
          )}
          {message.image && (
            <img
              src={message.image}
              alt="Message attachment"
              className="max-w-full rounded-2xl mb-2"
            />
          )}
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        <div className={`mt-1 flex items-center gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <p className="text-xs text-warmGray-500">
            {formatDistanceToNow(new Date(message.createdAt))}
          </p>
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="text-xs text-warmGray-500 hover:text-warmGray-700"
            >
              Reply
            </button>
          )}
        </div>

        {showSeen && (
          <div className="mt-1 text-xs text-warmGray-400">Seen</div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;

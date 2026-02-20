import { formatDistanceToNow } from '../../utils/helpers';
import MessageStatus from './MessageStatus';

const MessageItem = ({ message, isOwn, onReply }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md xxl:max-w-lg px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-primary-500 text-white rounded-br-none'
            : 'bg-cream-200 text-warmGray-900 rounded-bl-none'
        } wrap-break-word`}
      >
        {message.parentMessage && (
          <div
            className={`mb-2 px-2 py-1 rounded-lg text-xs border ${
              isOwn ? 'bg-primary-600 border-primary-400 text-primary-100' : 'bg-cream-100 border-cream-300 text-warmGray-600'
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
            className="max-w-full rounded mb-2"
          />
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className="flex items-center justify-between gap-3 mt-1">
          <p
            className={`text-xs ${
              isOwn ? 'text-primary-100' : 'text-warmGray-600'
            }`}
          >
            {formatDistanceToNow(new Date(message.createdAt))}
          </p>
          <div className="flex items-center gap-2">
            {onReply && (
              <button
                type="button"
                onClick={() => onReply(message)}
                className={`${
                  isOwn ? 'text-primary-100 hover:text-primary-50' : 'text-warmGray-500 hover:text-warmGray-700'
                } text-xs`}
              >
                Reply
              </button>
            )}
            {isOwn && (
              <MessageStatus status={message.status} isRead={message.isRead} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;

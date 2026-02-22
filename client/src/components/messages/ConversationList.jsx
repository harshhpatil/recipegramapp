import { useState } from 'react';
import Loading from '../common/Loading';
import { formatDistanceToNow } from '../../utils/helpers';

const ConversationList = ({
  conversations = [],
  loading = false,
  error = null,
  onSelectConversation
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center py-8">
          <p className="text-error-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Search Input */}
      <div className="p-4 border-b border-cream-300 sticky top-0 bg-cream-100 z-10">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm text-warmGray-900 placeholder:text-warmGray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>

      {/* Conversations */}
      {filteredConversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto text-warmGray-200 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-warmGray-500 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        </div>
      ) : (
        <div>
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.userId}
              onClick={() => onSelectConversation(conversation)}
              className="w-full px-4 py-3 border-b border-cream-300 hover:bg-cream-50 transition-colors duration-200 text-left group"
            >
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="shrink-0">
                  <img
                    src={
                      conversation.profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`
                    }
                    alt={conversation.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-warmGray-900 truncate">
                    {conversation.username}
                  </h3>
                  <p className="text-sm text-warmGray-500 truncate">
                    {conversation.isCurrentUserSender ? 'You: ' : ''}{conversation.lastMessage}
                  </p>
                </div>

                <div className="shrink-0 text-xs text-warmGray-400">
                  {conversation.lastMessageTime
                    ? formatDistanceToNow(new Date(conversation.lastMessageTime))
                    : ''}
                </div>

                {/* Unread Badge */}
                {conversation.unreadCount > 0 && (
                  <div className="shrink-0">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-primary-500 text-white">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;

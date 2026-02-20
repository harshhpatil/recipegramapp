import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addOptimisticMessage,
  clearConversationUnread,
  fetchConversation,
  markMessageAsRead,
  sendMessage
} from '../../store/slices/messageSlice';
import {
  emitStopTyping,
  emitTyping,
  getSocket,
  markConversationReadSocket,
  sendSocketMessage
} from '../../utils/socket';
import MessageItem from './MessageItem';
import Loading from '../common/Loading';

const ChatWindow = ({ conversation, onBack }) => {
  const dispatch = useDispatch();
  const { currentConversation, loading, typing } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastReadMarkerRef = useRef(null);
  
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const typingUser = typing?.[conversation.userId];

  // Fetch conversation on load
  useEffect(() => {
    if (conversation.userId) {
      dispatch(fetchConversation({ userId: conversation.userId, currentUserId: user?._id }));
    }
  }, [conversation.userId, dispatch, user?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation.messages]);

  // Handle typing indicator
  useEffect(() => {
    if (isTyping) {
      emitTyping(conversation.userId);
    } else {
      emitStopTyping(conversation.userId);
    }
  }, [isTyping, conversation.userId]);

  useEffect(() => {
    if (!conversation.userId || !user?._id) return;

    const unreadMessages = currentConversation.messages.filter(
      (message) => message.sender?._id === conversation.userId && !message.isRead
    );

    if (!unreadMessages.length) return;

    const lastUnreadId = unreadMessages[unreadMessages.length - 1]._id;
    if (lastReadMarkerRef.current === lastUnreadId) return;

    lastReadMarkerRef.current = lastUnreadId;
    const socket = getSocket();
    if (socket?.connected) {
      markConversationReadSocket(conversation.userId);
    } else {
      unreadMessages.forEach((message) => {
        if (message._id && !message.tempId) {
          dispatch(markMessageAsRead(message._id));
        }
      });
    }
    dispatch(clearConversationUnread({ userId: conversation.userId }));
  }, [currentConversation.messages, conversation.userId, dispatch, user?._id]);

  useEffect(() => {
    if (!conversation.userId || !user?._id) return;

    const intervalId = setInterval(() => {
      dispatch(fetchConversation({
        userId: conversation.userId,
        currentUserId: user._id,
        page: 1,
        limit: 25
      }));
    }, 45000);

    return () => clearInterval(intervalId);
  }, [conversation.userId, dispatch, user?._id]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageContent.trim()) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const nowIso = new Date().toISOString();
    const parentMessageId = replyTo && !replyTo.tempId ? replyTo._id : null;

    const optimisticMessage = {
      _id: tempId,
      tempId,
      sender: user,
      recipient: {
        _id: conversation.userId,
        username: conversation.username,
        profileImage: conversation.profileImage
      },
      content: messageContent.trim(),
      image: null,
      createdAt: nowIso,
      isRead: false,
      status: 'sending',
      parentMessage: replyTo
        ) : (
            _id: replyTo._id,
            content: replyTo.content,
            sender: replyTo.sender,
            recipient: replyTo.recipient,
            createdAt: replyTo.createdAt
          }
                onReply={() => setReplyTo(message)}
    };

            {typingUser && (
              <div className="text-xs text-warmGray-500">
                {typingUser.username} is typing...
              </div>
            )}
    dispatch(addOptimisticMessage({
      conversationUserId: conversation.userId,
      message: optimisticMessage
    }));

    const socket = getSocket();
    if (socket?.connected) {
      sendSocketMessage(conversation.userId, messageContent.trim(), null, {
        clientTempId: tempId,
        parentMessageId
      });
    } else {
      dispatch(sendMessage({
        recipientId: conversation.userId,
        content: messageContent.trim(),
        image: null,
        parentMessageId,
        tempId
      }));
    }

    setMessageContent('');
    setIsTyping(false);
    setReplyTo(null);
  };

  return (
    <div className="flex flex-col bg-white h-screen md:h-auto md:flex-1">
      {/* Header */}
      <div className="border-b border-cream-200 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-cream-100 rounded-lg transition-colors -ml-2"
            title="Back"
          >
            <svg
              className="w-5 h-5 text-warmGray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          
          <img
            src={
              conversation.profileImage ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`
            }
            alt={conversation.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold text-warmGray-900">{conversation.username}</h2>
            <p className="text-xs text-warmGray-500">Active now</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-cream-100 rounded-lg transition-colors hidden sm:block" title="Voice call">
            <svg
              className="w-5 h-5 text-warmGray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>

          <button className="p-2 hover:bg-cream-100 rounded-lg transition-colors hidden sm:block" title="Video call">
            <svg
              className="w-5 h-5 text-warmGray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-cream-50 to-white">
        {loading ? (
          <Loading />
        ) : currentConversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-warmGray-500">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {currentConversation.messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                isOwn={message.sender._id === user._id}
                onReply={setReplyTo}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t border-cream-200 p-4 bg-white shrink-0">
        {replyTo && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-cream-100 border border-cream-200 flex items-start justify-between gap-3">
            <div className="text-xs text-warmGray-600">
              <span className="font-semibold">Replying to</span>{' '}
              {replyTo.sender?.username || 'message'}: {replyTo.content}
            </div>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-warmGray-500 hover:text-warmGray-700"
              title="Cancel reply"
            >
              x
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors shrink-0"
            title="Attach file"
          >
            <svg
              className="w-5 h-5 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4"
              />
            </svg>
          </button>

          <input
            type="text"
            value={messageContent}
            onChange={(e) => {
              setMessageContent(e.target.value);
              setIsTyping(true);
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
              }, 2000);
            }}
            onBlur={() => setIsTyping(false)}
            placeholder="Type a message..."
            className="input flex-1"
          />

          <button
            type="submit"
            disabled={!messageContent.trim()}
            className="btn-primary px-4 shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

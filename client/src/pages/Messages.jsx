import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchConversations, setCurrentConversation } from '../store/slices/messageSlice';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';

const Messages = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { conversations, currentConversation, loading, error } = useSelector(
    (state) => state.messages
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchConversations());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      dispatch(fetchConversations());
    }, 45000);

    return () => clearInterval(intervalId);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const openConversation = location.state?.openConversation;
    if (openConversation?.userId) {
      setSelectedConversation(openConversation);
      dispatch(setCurrentConversation(openConversation.userId));
    }
  }, [dispatch, location.state]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    dispatch(setCurrentConversation(conversation.userId));
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    dispatch(setCurrentConversation(null));
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-neutral-50">
      {/* Conversations List - Hidden on mobile when chat is open */}
      {!selectedConversation && (
        <div className="w-full md:w-80 border-r border-neutral-200 bg-white flex flex-col">
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-neutral-900">Messages</h1>
              <button
                type="button"
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                Requests
              </button>
            </div>
          </div>
          <ConversationList
            conversations={conversations}
            loading={loading}
            error={error}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      )}

      {/* Chat Window - Full width on mobile, flex-1 on desktop */}
      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          onBack={handleBackToList}
        />
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-50">
          <div className="text-center">
            <svg
              className="w-24 h-24 mx-auto text-neutral-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-neutral-700 mb-2">
              Select a conversation
            </h2>
            <p className="text-neutral-500">
              Choose a conversation to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;


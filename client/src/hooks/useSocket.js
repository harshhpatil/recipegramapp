import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addReceivedMessage,
  acknowledgeMessageSent,
  markMessageDelivered,
  markMessagesRead,
  setUserTyping,
  clearUserTyping,
  setUserOnline,
  setUserOffline,
  updateConversation,
  markMessageReadWebSocket,
  incrementUnreadCount
} from "../store/slices/messageSlice";
import { getSocket, initializeSocket, disconnectSocket } from "../utils/socket";

/**
 * Hook to manage socket connections and events
 * Includes error handling to prevent socket initialization from crashing the app
 */
export const useSocket = (token) => {
  const dispatch = useDispatch();
  const currentConversationUserId = useSelector(
    (state) => state.messages.currentConversation.userId
  );
  const currentConversationUserIdRef = useRef(currentConversationUserId);

  useEffect(() => {
    currentConversationUserIdRef.current = currentConversationUserId;
  }, [currentConversationUserId]);

  useEffect(() => {
    if (!token) return;

    try {
      // Initialize socket
      const socket = initializeSocket(token);

      // Event: Receive message
      socket.on("receive_message", (data) => {
        try {
          dispatch(addReceivedMessage(data));
          if (currentConversationUserIdRef.current !== data.sender?._id) {
            dispatch(incrementUnreadCount());
          }
        } catch (error) {
          console.error("Error handling receive_message:", error);
        }
      });

      // Event: Message sent acknowledgment
      socket.on("message_sent", (data) => {
        try {
          if (data?.message) {
            const status = data.message.isRead ? "read" : "sent";
            dispatch(
              acknowledgeMessageSent({
                tempId: data.clientTempId,
                message: { ...data.message, status }
              })
            );
          }
        } catch (error) {
          console.error("Error handling message_sent:", error);
        }
      });

      // Event: Message delivered
      socket.on("message_delivered", (data) => {
        try {
          dispatch(
            markMessageDelivered({
              messageId: data.messageId,
              tempId: data.clientTempId || null
            })
          );
        } catch (error) {
          console.error("Error handling message_delivered:", error);
        }
      });

      // Event: Message error
      socket.on("message_error", (data) => {
        try {
          console.error("Message error:", data);
        } catch (error) {
          console.error("Error handling message_error:", error);
        }
      });

      // Event: User typing
      socket.on("user_typing", (data) => {
        try {
          dispatch(setUserTyping(data));
        } catch (error) {
          console.error("Error handling user_typing:", error);
        }
      });

      // Event: User stopped typing
      socket.on("user_stopped_typing", (data) => {
        try {
          dispatch(clearUserTyping(data));
        } catch (error) {
          console.error("Error handling user_stopped_typing:", error);
        }
      });

      // Event: User online
      socket.on("user_online", (data) => {
        try {
          dispatch(setUserOnline(data));
        } catch (error) {
          console.error("Error handling user_online:", error);
        }
      });

      // Event: User offline
      socket.on("user_offline", (data) => {
        try {
          dispatch(setUserOffline(data));
        } catch (error) {
          console.error("Error handling user_offline:", error);
        }
      });

      // Event: Conversation updated
      socket.on("conversation_updated", (data) => {
        try {
          dispatch(updateConversation(data));
        } catch (error) {
          console.error("Error handling conversation_updated:", error);
        }
      });

      // Event: Message read
      socket.on("message_read", (data) => {
        try {
          dispatch(markMessageReadWebSocket(data));
        } catch (error) {
          console.error("Error handling message_read:", error);
        }
      });

      socket.on("messages_read", (data) => {
        try {
          dispatch(markMessagesRead(data));
        } catch (error) {
          console.error("Error handling messages_read:", error);
        }
      });

      // Event: Incoming call
      socket.on("incoming_call", (data) => {
        try {
          console.log("Incoming call:", data);
        } catch (error) {
          console.error("Error handling incoming_call:", error);
        }
      });

      // Event: Call accepted
      socket.on("call_accepted", (data) => {
        try {
          console.log("Call accepted:", data);
        } catch (error) {
          console.error("Error handling call_accepted:", error);
        }
      });

      // Event: Call ended
      socket.on("call_ended", (data) => {
        try {
          console.log("Call ended:", data);
        } catch (error) {
          console.error("Error handling call_ended:", error);
        }
      });

      return () => {
        // Cleanup listeners
        socket.off("receive_message");
        socket.off("message_sent");
        socket.off("message_delivered");
        socket.off("message_error");
        socket.off("user_typing");
        socket.off("user_stopped_typing");
        socket.off("user_online");
        socket.off("user_offline");
        socket.off("conversation_updated");
        socket.off("message_read");
        socket.off("messages_read");
        socket.off("incoming_call");
        socket.off("call_accepted");
        socket.off("call_ended");
      };
    } catch (error) {
      console.error("Error initializing socket:", error);
      // Return empty cleanup function if initialization fails
      return () => {};
    }
  }, [token, dispatch]);

  return getSocket();
};

/**
 * Hook to handle socket disconnection on logout
 */
export const useSocketDisconnect = () => {
  return () => {
    disconnectSocket();
  };
};

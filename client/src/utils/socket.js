import { io } from "socket.io-client";

let socket = null;

/**
 * Initialize socket connection
 */
export const initializeSocket = (token) => {
  try {
    if (socket) {
      return socket;
    }

    const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    // Join user's personal room
    socket.emit("join_room", { });
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

    return socket;
  } catch (error) {
    console.error("Failed to initialize socket:", error);
    // Return a mock socket that doesn't throw on method calls
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      disconnect: () => {}
    };
  }
};

/**
 * Get socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Emit send message
 */
export const sendSocketMessage = (recipientId, content, image, options = {}) => {
  if (socket) {
    socket.emit("send_message", {
      recipientId,
      content,
      image,
      parentMessageId: options.parentMessageId || null,
      clientTempId: options.clientTempId || null
    });
  }
};

/**
 * Emit typing indicator
 */
export const emitTyping = (recipientId) => {
  if (socket) {
    socket.emit("typing", { recipientId });
  }
};

/**
 * Emit stop typing
 */
export const emitStopTyping = (recipientId) => {
  if (socket) {
    socket.emit("stop_typing", { recipientId });
  }
};

/**
 * Mark message as read via socket
 */
export const markMessageReadSocket = (messageId) => {
  if (socket) {
    socket.emit("mark_as_read", { messageId });
  }
};

/**
 * Mark conversation as read via socket
 */
export const markConversationReadSocket = (partnerId) => {
  if (socket) {
    socket.emit("mark_conversation_read", { partnerId });
  }
};

/**
 * Request call
 */
export const requestCall = (recipientId, callType = "video", callId) => {
  if (socket) {
    socket.emit("call_request", {
      recipientId,
      callType,
      callId
    });
  }
};

/**
 * Accept call
 */
export const acceptCall = (callerId, callId) => {
  if (socket) {
    socket.emit("accept_call", {
      callerId,
      callId
    });
  }
};

/**
 * End call
 */
export const endCall = (otherUserId, callId) => {
  if (socket) {
    socket.emit("end_call", {
      otherUserId,
      callId
    });
  }
};

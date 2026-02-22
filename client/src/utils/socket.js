import { io } from "socket.io-client";

let socket = null;
let activeToken = null;

const buildSocketUrl = () => {
  const rawUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return rawUrl.replace(/\/api\/?$/, "");
};

const createNoopSocket = () => ({
  on: () => {},
  off: () => {},
  emit: () => {},
  disconnect: () => {}
});

/**
 * Initialize socket connection
 */
export const initializeSocket = (token) => {
  try {
    if (socket && activeToken === token) {
      return socket;
    }

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    const socketUrl = buildSocketUrl();
    activeToken = token || null;

    socket = io(socketUrl, {
      auth: {
        token: token || null
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join_room", {});
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
    return createNoopSocket();
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
    activeToken = null;
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

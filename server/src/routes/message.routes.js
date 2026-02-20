import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  getUnreadCount
} from "../controller/message.controller.js";

const router = express.Router();

// All message routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /messages
 * @desc    Send a new message
 * @access  Private
 */
router.post("/", sendMessage);

/**
 * @route   GET /messages
 * @desc    Get all conversations (inbox)
 * @access  Private
 */
router.get("/", getConversations);

/**
 * @route   GET /messages/unread/count
 * @desc    Get count of unread messages
 * @access  Private
 */
router.get("/unread/count", getUnreadCount);

/**
 * @route   GET /messages/:conversationWith
 * @desc    Get conversation with specific user
 * @access  Private
 */
router.get("/:conversationWith", getConversation);

/**
 * @route   PUT /messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put("/:messageId/read", markAsRead);

/**
 * @route   DELETE /messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete("/:messageId", deleteMessage);

export default router;

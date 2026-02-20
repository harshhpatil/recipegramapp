import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";

/**
 * Send a message
 * @route POST /messages
 * @access Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, image, parentMessageId } = req.body;
    const senderId = req.user._id;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Prevent sending message to self
    if (senderId.toString() === recipientId) {
      return res.status(400).json({ message: "Cannot send message to yourself" });
    }

    let parentMessage = null;
    if (parentMessageId) {
      parentMessage = await Message.findById(parentMessageId);
      if (!parentMessage) {
        return res.status(400).json({ message: "Parent message not found" });
      }

      const isSameConversation =
        (parentMessage.sender.toString() === senderId.toString() &&
          parentMessage.recipient.toString() === recipientId) ||
        (parentMessage.sender.toString() === recipientId &&
          parentMessage.recipient.toString() === senderId.toString());

      if (!isSameConversation) {
        return res.status(400).json({ message: "Invalid parent message" });
      }
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
      image: image || null,
      parentMessage: parentMessageId || null
    });

    // Populate sender and recipient data
    await message.populate([
      { path: "sender", select: "username profileImage" },
      { path: "recipient", select: "username profileImage" },
      {
        path: "parentMessage",
        select: "content sender recipient createdAt",
        populate: [
          { path: "sender", select: "username profileImage" },
          { path: "recipient", select: "username profileImage" }
        ]
      }
    ]);

    res.status(201).json({
      message: "Message sent successfully",
      data: message
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

/**
 * Get conversation between two users
 * @route GET /messages/:conversationWith
 * @access Private
 */
export const getConversation = async (req, res) => {
  try {
    const { conversationWith } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Validate conversation partner exists
    const partner = await User.findById(conversationWith);
    if (!partner) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get total count
    const total = await Message.countDocuments({
      $or: [
        { sender: userId, recipient: conversationWith },
        { sender: conversationWith, recipient: userId }
      ]
    });

    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: conversationWith },
        { sender: conversationWith, recipient: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate([
        { path: "sender", select: "username profileImage" },
        { path: "recipient", select: "username profileImage" },
        {
          path: "parentMessage",
          select: "content sender recipient createdAt",
          populate: [
            { path: "sender", select: "username profileImage" },
            { path: "recipient", select: "username profileImage" }
          ]
        }
      ]);

    res.json({
      page,
      limit,
      total,
      messages: messages.reverse() // Reverse to get chronological order
    });
  } catch (err) {
    console.error("Get conversation error:", err);
    res.status(500).json({ message: "Failed to fetch conversation" });
  }
};

/**
 * Get all conversations (list of users with recent messages)
 * @route GET /messages
 * @access Private
 */
export const getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Find all unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$recipient",
              "$sender"
            ]
          },
          lastMessage: { $first: "$content" },
          lastMessageTime: { $first: "$createdAt" },
          lastMessageSender: { $first: "$sender" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$sender", userId] },
                    { $eq: ["$isRead", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          userId: "$_id",
          username: "$user.username",
          profileImage: "$user.profileImage",
          lastMessage: 1,
          lastMessageTime: 1,
          lastMessageSender: 1,
          unreadCount: 1,
          isCurrentUserSender: { $eq: ["$lastMessageSender", userId] }
        }
      }
    ]);

    res.json({
      conversations
    });
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

/**
 * Mark message as read
 * @route PUT /messages/:messageId/read
 * @access Private
 */
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    ).populate([
      { path: "sender", select: "username profileImage" },
      { path: "recipient", select: "username profileImage" }
    ]);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({
      message: "Message marked as read",
      data: message
    });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to mark message as read" });
  }
};

/**
 * Delete a message
 * @route DELETE /messages/:messageId
 * @access Private
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete their own message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

/**
 * Get unread message count
 * @route GET /messages/unread/count
 * @access Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

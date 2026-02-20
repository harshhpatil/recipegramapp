import Notification from "../models/Notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user._id
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username profileImage")
      .populate("post", "image caption");

    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndUpdate(notificationId, {
      isRead: true
    });

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

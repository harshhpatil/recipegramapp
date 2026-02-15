import Comment from "../models/Comment.model.js";
import Post from "../models/Post.model.js";
import createNotification from "../util/createNotification.js";

/**
 * Add a comment to a post
 * @route POST /comments/:postId
 * @access Private
 */
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 }
    });

    // Populate user info before sending response
    await comment.populate("user", "username profileImage");

    // Only send notification if not commenting on own post
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification({
        receiver: post.author,
        sender: req.user._id,
        type: "comment",
        post: postId
      });
    }

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

/**
 * Get all comments for a post
 * @route GET /comments/:postId
 * @access Private
 */
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImage");

    res.json({ comments });
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

/**
 * Delete a comment (author only)
 * @route DELETE /comments/:commentId
 * @access Private
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Authorization check - only comment author can delete
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 }
    });

    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};



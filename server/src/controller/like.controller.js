import createNotification from "../util/createNotification.js";
import Like from "../models/Like.model.js";
import Post from "../models/Post.model.js";

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingLike = await Like.findOne({
      user: req.user._id,
      post: postId
    });

    if (existingLike) {
      await existingLike.deleteOne();
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

      return res.json({ message: "Post unliked" });
    }

    await Like.create({
      user: req.user._id,
      post: postId
    });

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    // after liking - only create notification if not liking own post
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification({
        receiver: post.author,
        sender: req.user._id,
        type: "like",
        post: postId
      });
    }

    res.json({ message: "Post liked" });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ message: "Like action failed" });
  }
};

export const checkIfLiked = async (req, res) => {
  try {
    const { postId } = req.params;

    const like = await Like.findOne({
      user: req.user._id,
      post: postId
    });

    res.json({ isLiked: !!like });
  } catch (err) {
    console.error("Check if liked error:", err);
    res.status(500).json({ message: "Failed to check like status" });
  }
};
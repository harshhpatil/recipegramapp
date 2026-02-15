import User from "../models/User.model.js";
import Post from "../models/Post.model.js";

/**
 * Toggle save/unsave a post
 * @route POST /save/:postId
 * @access Private
 */
export const toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);

    const alreadySaved = user.savedPosts.includes(postId);

    if (alreadySaved) {
      user.savedPosts.pull(postId);
      await user.save();
      return res.json({ message: "Post unsaved", isSaved: false });
    }

    user.savedPosts.push(postId);
    await user.save();

    res.json({ message: "Post saved", isSaved: true });
  } catch (err) {
    console.error("Save action error:", err);
    res.status(500).json({ message: "Save action failed" });
  }
};

/**
 * Get all saved posts for current user with pagination
 * @route GET /save?page=1&limit=10
 * @access Private
 */
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findById(userId);
    
    const total = user.savedPosts.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Get paginated saved posts
    const savedPostIds = user.savedPosts.slice(skip, skip + limit);
    
    const posts = await Post.find({ _id: { $in: savedPostIds } })
      .populate("author", "username profileImage")
      .sort({ createdAt: -1 });

    res.json({
      page,
      limit,
      total,
      totalPages,
      posts
    });
  } catch (err) {
    console.error("Get saved posts error:", err);
    res.status(500).json({ message: "Failed to fetch saved posts" });
  }
};

/**
 * Check if current user has saved a post
 * @route GET /save/:postId/check
 * @access Private
 */
export const checkIfSaved = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isSaved = user.savedPosts.includes(postId);

    res.json({ isSaved });
  } catch (err) {
    console.error("Check if saved error:", err);
    res.status(500).json({ message: "Failed to check save status" });
  }
};

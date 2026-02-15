import Post from "../models/Post.model.js";
import Follow from "../models/Follow.model.js";
import Comment from "../models/Comment.model.js";
import Like from "../models/Like.model.js";

export const createPost = async (req, res) => {
  try {
    const { caption, ingredients, steps, image } = req.body;

    if (!caption || !image) {
      return res.status(400).json({ message: "Caption and image are required" });
    }

    const post = await Post.create({
      caption,
      ingredients,
      steps,
      image,
      author: req.user._id
    });

    // Populate author data directly on the created post
    await post.populate("author", "username profileImage");

    res.status(201).json({
      message: "Post created successfully",
      post
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    res.json({
      page,
      limit,
      total,
      totalPages,
      posts
    });
  } catch (err) {
    console.error("Get all posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate("author", "username profileImage");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Get post by ID error:", err);
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get list of users the current user is following (use distinct for better performance)
    const followingIds = await Follow.distinct("following", { follower: req.user._id });

    // Include the current user's own posts as well
    followingIds.push(req.user._id);

    const total = await Post.countDocuments({ author: { $in: followingIds } });
    const totalPages = Math.ceil(total / limit);

    const posts = await Post.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    res.json({
      page,
      limit,
      total,
      totalPages,
      posts
    });
  } catch (err) {
    console.error("Get feed error:", err);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, ingredients, steps, image } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Authorization check - only post author can update
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Validation
    if (caption !== undefined && caption.trim().length === 0) {
      return res.status(400).json({ message: "Caption cannot be empty" });
    }

    // Update only provided fields
    if (caption !== undefined) post.caption = caption;
    if (ingredients !== undefined) post.ingredients = ingredients;
    if (steps !== undefined) post.steps = steps;
    if (image !== undefined) post.image = image;

    await post.save();
    await post.populate("author", "username profileImage");

    res.json({ message: "Post updated successfully", post });
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Authorization check - only post author can delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Cascade delete: remove all comments and likes associated with this post
    await Comment.deleteMany({ post: id });
    await Like.deleteMany({ post: id });

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search in caption, ingredients array
    const searchRegex = new RegExp(q.trim(), 'i');
    const query = {
      $or: [
        { caption: searchRegex },
        { ingredients: searchRegex }
      ]
    };

    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username profileImage");

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      posts,
      query: q
    });
  } catch (err) {
    console.error("Search posts error:", err);
    res.status(500).json({ message: "Failed to search posts" });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get posts from last 7 days, sorted by likes count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await Post.find({ 
      createdAt: { $gte: sevenDaysAgo } 
    })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(limit)
      .populate("author", "username profileImage");

    res.json({ posts });
  } catch (err) {
    console.error("Get trending posts error:", err);
    res.status(500).json({ message: "Failed to fetch trending posts" });
  }
};

import Post from "../models/Post.model.js";
import Follow from "../models/Follow.model.js";

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

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    res.json({
      page,
      limit,
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

    const posts = await Post.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    res.json({
      page,
      limit,
      posts
    });
  } catch (err) {
    console.error("Get feed error:", err);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
};

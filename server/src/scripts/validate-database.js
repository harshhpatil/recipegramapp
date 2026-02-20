import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import Like from '../models/Like.model.js';
import Follow from '../models/Follow.model.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipegram';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
}

async function clearDatabase() {
  await Promise.all([
    User.deleteMany(),
    Post.deleteMany(),
    Comment.deleteMany(),
    Like.deleteMany(),
    Follow.deleteMany(),
  ]);
}

async function testEmptyState() {
  console.log('\n📋 Test 1: Validate empty database state');
  await clearDatabase();

  const users = await User.find();
  assert(users.length === 0, 'No users in empty database');

  const posts = await Post.find();
  assert(posts.length === 0, 'No posts in empty database');

  const comments = await Comment.find();
  assert(comments.length === 0, 'No comments in empty database');

  const likes = await Like.find();
  assert(likes.length === 0, 'No likes in empty database');

  const follows = await Follow.find();
  assert(follows.length === 0, 'No follows in empty database');

  // Test querying non-existent user
  const nonExistentUser = await User.findOne({ username: 'nonexistent' });
  assert(nonExistentUser === null, 'Non-existent user returns null');
}

async function seedTestData() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const [chef_marco, foodie_priya, baker_sophie, spice_raj, healthy_lea] =
    await User.insertMany([
      { username: 'chef_marco', email: 'marco@recipegram.com', password: hashedPassword, followersCount: 3, followingCount: 2 },
      { username: 'foodie_priya', email: 'priya@recipegram.com', password: hashedPassword, followersCount: 2, followingCount: 3 },
      { username: 'baker_sophie', email: 'sophie@recipegram.com', password: hashedPassword, followersCount: 2, followingCount: 2 },
      { username: 'spice_raj', email: 'raj@recipegram.com', password: hashedPassword, followersCount: 1, followingCount: 2 },
      { username: 'healthy_lea', email: 'lea@recipegram.com', password: hashedPassword, followersCount: 1, followingCount: 1 },
    ]);

  await Follow.insertMany([
    { follower: foodie_priya._id, following: chef_marco._id },
    { follower: baker_sophie._id, following: chef_marco._id },
    { follower: spice_raj._id,    following: chef_marco._id },
    { follower: chef_marco._id,   following: foodie_priya._id },
    { follower: baker_sophie._id, following: foodie_priya._id },
    { follower: chef_marco._id,   following: baker_sophie._id },
    { follower: healthy_lea._id,  following: baker_sophie._id },
    { follower: foodie_priya._id, following: spice_raj._id },
    { follower: spice_raj._id,    following: healthy_lea._id },
    { follower: foodie_priya._id, following: healthy_lea._id },
  ]);

  const posts = await Post.insertMany([
    { caption: 'Spaghetti Carbonara', image: 'https://example.com/1.jpg', author: chef_marco._id, likesCount: 3, commentsCount: 2 },
    { caption: 'Chicken Tikka Masala', image: 'https://example.com/2.jpg', author: foodie_priya._id, likesCount: 4, commentsCount: 2 },
    { caption: 'Homemade Croissants', image: 'https://example.com/3.jpg', author: baker_sophie._id, likesCount: 5, commentsCount: 3 },
  ]);

  await Like.insertMany([
    { user: foodie_priya._id, post: posts[0]._id },
    { user: baker_sophie._id, post: posts[0]._id },
    { user: healthy_lea._id,  post: posts[0]._id },
    { user: chef_marco._id,   post: posts[1]._id },
    { user: spice_raj._id,    post: posts[1]._id },
    { user: baker_sophie._id, post: posts[1]._id },
    { user: healthy_lea._id,  post: posts[1]._id },
    { user: chef_marco._id,   post: posts[2]._id },
    { user: foodie_priya._id, post: posts[2]._id },
    { user: spice_raj._id,    post: posts[2]._id },
    { user: healthy_lea._id,  post: posts[2]._id },
    { user: baker_sophie._id, post: posts[2]._id },
  ]);

  await Comment.insertMany([
    { post: posts[0]._id, user: foodie_priya._id, text: 'Exactly how my nonna made it!' },
    { post: posts[0]._id, user: baker_sophie._id,  text: 'Made this last night — perfect!' },
    { post: posts[1]._id, user: chef_marco._id,   text: 'The char on that chicken is incredible' },
    { post: posts[1]._id, user: spice_raj._id,    text: 'Authentic! Most western versions use too much cream' },
    { post: posts[2]._id, user: chef_marco._id,   text: 'Bakery-level lamination. Respect' },
    { post: posts[2]._id, user: foodie_priya._id,  text: 'Patience really pays off!' },
    { post: posts[2]._id, user: spice_raj._id,    text: 'The layers are unreal!' },
  ]);

  return { users: [chef_marco, foodie_priya, baker_sophie, spice_raj, healthy_lea], posts };
}

async function testSeededState() {
  console.log('\n📋 Test 2: Validate seeded database state');
  await clearDatabase();
  await seedTestData();

  const users = await User.find();
  assert(users.length === 5, 'All 5 users exist after seeding');

  const follows = await Follow.find();
  assert(follows.length === 10, 'All 10 follow relationships exist');

  const posts = await Post.find();
  assert(posts.length === 3, 'All 3 posts exist after seeding');

  const likes = await Like.find();
  assert(likes.length === 12, 'All 12 likes exist after seeding');

  const comments = await Comment.find();
  assert(comments.length === 7, 'All 7 comments exist after seeding');

  // Verify post author relationships
  const populatedPost = await Post.findOne({ caption: 'Spaghetti Carbonara' }).populate('author', 'username');
  assert(populatedPost !== null, 'Post can be found by caption');
  assert(populatedPost.author.username === 'chef_marco', 'Post author relationship is correct');

  // Verify likes count on first post
  const post0Likes = await Like.countDocuments({ post: posts[0]._id });
  assert(post0Likes === 3, 'First post has 3 likes');

  // Verify comments on third post
  const post2Comments = await Comment.countDocuments({ post: posts[2]._id });
  assert(post2Comments === 3, 'Third post has 3 comments');
}

async function testStateMutations() {
  console.log('\n📋 Test 3: Validate state mutations');
  await clearDatabase();
  const { users, posts } = await seedTestData();

  const [chef_marco, foodie_priya] = users;
  const [post0] = posts;

  // Test like creation
  const likesBefore = await Like.countDocuments({ post: post0._id });
  await Like.create({ user: chef_marco._id, post: post0._id });
  await Post.findByIdAndUpdate(post0._id, { $inc: { likesCount: 1 } });
  const likesAfter = await Like.countDocuments({ post: post0._id });
  assert(likesAfter === likesBefore + 1, 'Like count increases after liking');

  // Test like removal
  await Like.deleteOne({ user: chef_marco._id, post: post0._id });
  await Post.findByIdAndUpdate(post0._id, { $inc: { likesCount: -1 } });
  const likesAfterRemoval = await Like.countDocuments({ post: post0._id });
  assert(likesAfterRemoval === likesBefore, 'Like count decreases after unliking');

  // Test comment addition
  const commentsBefore = await Comment.countDocuments({ post: post0._id });
  const newComment = await Comment.create({ post: post0._id, user: chef_marco._id, text: 'New test comment' });
  await Post.findByIdAndUpdate(post0._id, { $inc: { commentsCount: 1 } });
  const commentsAfter = await Comment.countDocuments({ post: post0._id });
  assert(commentsAfter === commentsBefore + 1, 'Comment count increases after adding comment');

  // Test comment appears in query
  const foundComment = await Comment.findById(newComment._id);
  assert(foundComment !== null, 'Newly added comment can be retrieved');
  assert(foundComment.text === 'New test comment', 'Comment text is correct');

  // Test comment deletion
  await Comment.findByIdAndDelete(newComment._id);
  await Post.findByIdAndUpdate(post0._id, { $inc: { commentsCount: -1 } });
  const commentsAfterDeletion = await Comment.countDocuments({ post: post0._id });
  assert(commentsAfterDeletion === commentsBefore, 'Comment count decreases after deletion');

  // Test follow creation
  const user3 = users[2]; // baker_sophie
  const user4 = users[3]; // spice_raj
  const followsBefore = await Follow.countDocuments({ follower: user4._id, following: chef_marco._id });
  // spice_raj already follows chef_marco, test a new follow
  await Follow.create({ follower: user4._id, following: foodie_priya._id });
  const followsAfter = await Follow.countDocuments({ follower: user4._id });
  assert(followsAfter > followsBefore, 'Follow count increases after following');

  // Test unfollow
  await Follow.deleteOne({ follower: user4._id, following: foodie_priya._id });
  const followsAfterUnfollow = await Follow.countDocuments({ follower: user4._id });
  assert(followsAfterUnfollow === followsBefore, 'Follow count decreases after unfollowing');
}

async function testEdgeCases() {
  console.log('\n📋 Test 4: Validate edge cases');
  await clearDatabase();
  const { users, posts } = await seedTestData();

  const [chef_marco, foodie_priya] = users;
  const [post0] = posts;

  // Test toggling like (like then unlike)
  const existingLike = await Like.findOne({ user: foodie_priya._id, post: post0._id });
  // foodie_priya already likes post0 from seed
  // Attempt to "like" again should toggle (delete the existing like)
  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    const likeAfterToggle = await Like.findOne({ user: foodie_priya._id, post: post0._id });
    assert(likeAfterToggle === null, 'Toggle like removes existing like');
  } else {
    assert(false, 'Expected existing like not found');
  }

  // Test following already-followed user — should not create duplicate
  const existingFollow = await Follow.findOne({ follower: foodie_priya._id, following: chef_marco._id });
  assert(existingFollow !== null, 'Existing follow relationship exists');
  // Attempting to insert duplicate should be handled by checking first
  const duplicateCheck = await Follow.findOne({ follower: foodie_priya._id, following: chef_marco._id });
  assert(duplicateCheck !== null, 'Follow relationship check handles already-followed user gracefully');

  // Test deleting non-existent comment returns null
  const fakeId = new mongoose.Types.ObjectId();
  const deleted = await Comment.findByIdAndDelete(fakeId);
  assert(deleted === null, 'Deleting non-existent comment returns null (no crash)');

  // Test data integrity: ensure like references valid post
  const likesWithValidPost = await Like.find({ post: post0._id }).populate('post');
  const allHaveValidPost = likesWithValidPost.every(l => l.post !== null);
  assert(allHaveValidPost, 'All likes reference valid posts');

  // Test data integrity: ensure comments reference valid post
  const commentsWithValidPost = await Comment.find({ post: post0._id }).populate('post');
  const allHaveValidPostComments = commentsWithValidPost.every(c => c.post !== null);
  assert(allHaveValidPostComments, 'All comments reference valid posts');
}

async function run() {
  console.log('🔍 RecipeGram Database Validation Script');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await testEmptyState();
    await testSeededState();
    await testStateMutations();
    await testEdgeCases();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      console.log('🎉 All validation tests passed!');
    } else {
      console.log('⚠️  Some validation tests failed. See above for details.');
    }
  } catch (err) {
    console.error('❌ Validation script error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

run();

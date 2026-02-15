import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { postService, commentService } from '../services';
import CommentSection from '../components/post/CommentSection';

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          postService.getPostById(postId),
          commentService.getComments(postId),
        ]);
        setPost(postResponse.data);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Post not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img 
          src={post.image} 
          alt={post.caption} 
          className="w-full h-96 object-cover"
        />
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
              {post.author?.profileImage ? (
                <img src={post.author.profileImage} alt={post.author.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                post.author?.username?.charAt(0).toUpperCase()
              )}
            </div>
            <span className="font-semibold">{post.author?.username}</span>
          </div>

          <h2 className="text-2xl font-bold mb-4">{post.caption}</h2>

          {post.ingredients && post.ingredients.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Ingredients:</h3>
              <ul className="list-disc list-inside space-y-1">
                {post.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {post.steps && post.steps.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Steps:</h3>
              <ol className="list-decimal list-inside space-y-2">
                {post.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex gap-4 py-4 border-t border-gray-200">
            <span>{post.likesCount} likes</span>
            <span>{post.commentsCount} comments</span>
          </div>

          <CommentSection postId={postId} comments={comments} setComments={setComments} />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

import { useState } from 'react';
import { usePosts } from '../../hooks';

const CreatePostModal = ({ isOpen, onClose }) => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createPost } = usePosts();

  const handleImageChange = (e) => {
    const value = e.target.value;
    setImage(value);
    setImagePreview(value);
    setImageError('');
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients.length > 0 ? newIngredients : ['']);
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps.length > 0 ? newSteps : ['']);
  };

  const updateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!caption.trim()) {
      setError('Caption is required');
      return;
    }
    
    if (!image.trim()) {
      setError('Image URL is required');
      return;
    }

    const isValidUrl = (str) => {
      try { const u = new URL(str); return u.protocol === 'http:' || u.protocol === 'https:'; }
      catch { return false; }
    };
    if (!isValidUrl(image.trim())) {
      setError('Please enter a valid image URL (must start with http:// or https://)');
      return;
    }

    setLoading(true);

    // Filter out empty ingredients and steps
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    const filteredSteps = steps.filter(step => step.trim() !== '');

    const postData = {
      caption: caption.trim(),
      image: image.trim(),
      ingredients: filteredIngredients,
      steps: filteredSteps,
    };

    try {
      const result = await createPost(postData);
      
      if (result.success) {
        // Reset form
        setCaption('');
        setImage('');
        setImagePreview('');
        setImageError('');
        setIngredients(['']);
        setSteps(['']);
        onClose();
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-warmGray-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-warmGray-900">Create New Recipe Post</h2>
            <button
              onClick={onClose}
              className="text-warmGray-500 hover:text-warmGray-700 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 card bg-error-50 border-error-200 text-error-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-warmGray-700 mb-2">
                Image URL *
              </label>
              <input
                type="text"
                value={image}
                onChange={handleImageChange}
                placeholder="https://example.com/image.jpg"
                className="input"
                disabled={loading}
                required
              />
              {imageError && (
                <p className="mt-1 text-sm text-error-600">{imageError}</p>
              )}
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                    onError={() => {
                      setImagePreview('');
                      setImageError('Invalid image URL. Please provide a valid image link.');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-warmGray-700 mb-2">
                Caption *
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe your recipe..."
                rows={3}
                className="input"
                disabled={loading}
                required
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-warmGray-700 mb-2">
                Ingredients
              </label>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    className="input flex-1"
                    disabled={loading}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="px-3 py-2 bg-error-500 text-white rounded-md hover:bg-error-600"
                      disabled={loading}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                disabled={loading}
              >
                + Add Ingredient
              </button>
            </div>

            {/* Steps */}
            <div>
              <label className="block text-sm font-medium text-warmGray-700 mb-2">
                Cooking Steps
              </label>
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <span className="flex items-center px-3 py-2 bg-cream-200 rounded-md font-medium text-warmGray-700">
                    {index + 1}.
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    rows={2}
                    className="input flex-1"
                    disabled={loading}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="px-3 py-2 bg-error-500 text-white rounded-md hover:bg-error-600"
                      disabled={loading}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                disabled={loading}
              >
                + Add Step
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:bg-warmGray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-warmGray-200 text-warmGray-700 rounded-md hover:bg-warmGray-300 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;

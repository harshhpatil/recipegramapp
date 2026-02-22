import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { userService } from '../../services';
import { fetchUserSuccess } from '../../store/slices/userSlice';
import { useToast } from '../../context/ToastContext';

const EditProfileModal = ({ isOpen, onClose, currentProfile }) => {
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  useEffect(() => {
    if (currentProfile) {
      setBio(currentProfile.bio || '');
      setProfileImage(currentProfile.profileImage || '');
      setImageError(false);
    }
  }, [currentProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userService.updateProfile({ bio, profileImage });
      dispatch(fetchUserSuccess(response.data));
      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-warmGray-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-warmGray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-warmGray-500 hover:text-warmGray-700 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-warmGray-700 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input"
                rows={4}
                maxLength={200}
                placeholder="Tell us about yourself..."
              />
              <p className="text-sm text-warmGray-500 mt-1">
                {bio.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => { setProfileImage(e.target.value); setImageError(false); }}
                className="input"
                placeholder="https://example.com/image.jpg"
              />
              {profileImage && !imageError && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img
                    src={profileImage}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-warmGray-200 text-warmGray-700 rounded-lg hover:bg-warmGray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default EditProfileModal;

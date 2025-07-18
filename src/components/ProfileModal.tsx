import React, { useState, useRef } from 'react';
import { X, Upload, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t } = useLanguage();
  const { user, userAvatar, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState<string | null>(userAvatar);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Only pass avatar data if it's different from current
      const avatarData = avatar !== userAvatar ? avatar || undefined : undefined;
      await updateProfile({ name: name.trim() }, avatarData || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB to prevent storage issues)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-auto my-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('profile')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {name.charAt(0).toUpperCase() || user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-gray-600">{t('profile.avatar')}</p>
              {avatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="text-xs text-red-600 hover:text-red-700 transition-colors"
                  disabled={isLoading}
                >
                  Remove avatar
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isLoading}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
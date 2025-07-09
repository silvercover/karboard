import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Edit, Trash2, Reply } from 'lucide-react';
import { Comment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { loadUserAvatar } from '../utils/auth';
import { v4 as uuidv4 } from 'uuid';
import { formatJalaliDate } from '../utils/jalali';
import { ConfirmDialog } from './ConfirmDialog';

interface CommentsProps {
  comments: Comment[];
  onCommentsChange: (comments: Comment[]) => void;
}

export function Comments({ comments, onCommentsChange }: CommentsProps) {
  const { t, language } = useLanguage();
  const { user, userAvatar } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userAvatars, setUserAvatars] = useState<{ [userId: string]: string }>({});

  // Load avatars for comment users
  useEffect(() => {
    const loadAvatars = async () => {
      const uniqueUserIds = [...new Set(comments.map(c => c.userId))];
      const avatarPromises = uniqueUserIds.map(async (userId) => {
        if (userId === user?.id) {
          return { userId, avatar: userAvatar };
        }
        try {
          const avatar = await loadUserAvatar(userId);
          return { userId, avatar };
        } catch (error) {
          console.error('Failed to load avatar for user:', userId, error);
          return { userId, avatar: null };
        }
      });

      const avatarResults = await Promise.all(avatarPromises);
      const avatarMap: { [userId: string]: string } = {};
      avatarResults.forEach(({ userId, avatar }) => {
        if (avatar) {
          avatarMap[userId] = avatar;
        }
      });
      setUserAvatars(avatarMap);
    };

    if (comments.length > 0) {
      loadAvatars();
    }
  }, [comments, user?.id, userAvatar]);

  // Organize comments by parent-child relationship
  const organizeComments = (comments: Comment[]) => {
    const topLevel: Comment[] = [];
    const replies: { [key: string]: Comment[] } = {};

    comments.forEach(comment => {
      if (comment.parentId) {
        if (!replies[comment.parentId]) {
          replies[comment.parentId] = [];
        }
        replies[comment.parentId].push(comment);
      } else {
        topLevel.push(comment);
      }
    });

    return { topLevel, replies };
  };

  const { topLevel, replies } = organizeComments(comments);

  const addComment = (parentId?: string) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim() || !user) return;

    const comment: Comment = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      userAvatarRef: user.avatarRef,
      text: text.trim(),
      parentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Immediately update comments - this will trigger auto-save in CardModal
    onCommentsChange([...comments, comment]);
    
    if (parentId) {
      setReplyText('');
      setReplyingTo(null);
    } else {
      setNewComment('');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingComment) return;

    const updatedComments = comments.map(comment =>
      comment.id === editingComment
        ? { ...comment, text: editText.trim(), updatedAt: new Date() }
        : comment
    );
    
    // Immediately update comments - this will trigger auto-save in CardModal
    onCommentsChange(updatedComments);
    setEditingComment(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteComment = () => {
    if (!commentToDelete) return;

    // Also delete all replies to this comment
    const commentToDeleteObj = comments.find(c => c.id === commentToDelete);
    if (commentToDeleteObj && !commentToDeleteObj.parentId) {
      // If it's a top-level comment, delete all its replies too
      const updatedComments = comments.filter(comment => 
        comment.id !== commentToDelete && comment.parentId !== commentToDelete
      );
      onCommentsChange(updatedComments);
    } else {
      // If it's a reply, just delete the reply
      const updatedComments = comments.filter(comment => comment.id !== commentToDelete);
      onCommentsChange(updatedComments);
    }

    setCommentToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, isReply = false, parentId?: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingComment) {
        saveEdit();
      } else if (isReply && parentId) {
        addComment(parentId);
      } else {
        addComment();
      }
    }
  };

  const getIndentLevel = (comment: Comment): number => {
    if (!comment.parentId) return 0;
    
    const parent = comments.find(c => c.id === comment.parentId);
    if (!parent) return 1;
    
    return Math.min(getIndentLevel(parent) + 1, 2); // Max 3 levels (0, 1, 2)
  };

  const renderComment = (comment: Comment, level = 0) => {
    const commentReplies = replies[comment.id] || [];
    const indentClass = level === 0 ? '' : level === 1 ? 'ml-8 rtl:mr-8 rtl:ml-0' : 'ml-16 rtl:mr-16 rtl:ml-0';
    const avatar = userAvatars[comment.userId];

    return (
      <div key={comment.id} className={`space-y-3 ${indentClass}`}>
        <div className="flex space-x-3 rtl:space-x-reverse">
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-medium text-sm text-gray-800">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatJalaliDate(comment.createdAt, language.code)}
                  </span>
                  {comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>
                {user?.id === comment.userId && (
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <button
                      onClick={() => startEdit(comment)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Edit className="w-3 h-3 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
              
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      {t('comment.save')}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 rounded text-sm transition-colors"
                    >
                      {t('comment.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                  {level < 2 && ( // Only show reply button for first 2 levels
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="mt-2 flex items-center space-x-1 rtl:space-x-reverse text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Reply className="w-3 h-3" />
                      <span>{t('comment.reply')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3 flex space-x-3 rtl:space-x-reverse">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, true, comment.id)}
                    placeholder={t('comment.reply.placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse mt-2">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 rounded text-sm transition-colors"
                    >
                      {t('comment.cancel')}
                    </button>
                    <button
                      onClick={() => addComment(comment.id)}
                      disabled={!replyText.trim()}
                      className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 rtl:space-x-reverse"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t('comment.post')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render replies */}
        {commentReplies.map(reply => renderComment(reply, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <MessageCircle className="w-4 h-4" />
        <span className="font-medium">{t('card.comments')}</span>
        {comments.length > 0 && (
          <span className="text-sm text-gray-500">({comments.length})</span>
        )}
      </div>

      {/* Add new comment */}
      <div className="flex space-x-3 rtl:space-x-reverse">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
            placeholder={t('comment.placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            rows={2}
          />
          <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse mt-2">
            <button
              onClick={() => addComment()}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Send className="w-4 h-4" />
              <span>{t('comment.post')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {topLevel.map(comment => renderComment(comment))}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t('comment.delete.confirm.title')}
        message={t('comment.delete.confirm.message')}
        confirmText={t('comment.delete.confirm.yes')}
        cancelText={t('comment.delete.confirm.no')}
        onConfirm={confirmDeleteComment}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setCommentToDelete(null);
        }}
        type="danger"
      />
    </div>
  );
}
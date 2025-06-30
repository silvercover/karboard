import React, { useState } from 'react';
import { X, Users, Mail, Shield, Trash2, UserMinus } from 'lucide-react';
import { Project } from '../types';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ConfirmDialog } from './ConfirmDialog';

interface ProjectSettingsProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSettings({ project, isOpen, onClose }: ProjectSettingsProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { inviteUser, updateMemberPermissions, removeMember } = useProject();
  const [activeTab, setActiveTab] = useState<'members' | 'invite'>('members');
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  if (!isOpen) return null;

  const isOwner = project.ownerId === user?.id;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;

    await inviteUser(project.id, inviteForm.email.trim(), inviteForm.name.trim());
    setInviteForm({ name: '', email: '' });
    setActiveTab('members');
  };

  const handlePermissionChange = (userId: string, permission: string, value: boolean) => {
    const member = project.members.find(m => m.userId === userId);
    if (!member) return;

    const newPermissions = {
      ...member.permissions,
      [permission]: value
    };

    updateMemberPermissions(project.id, userId, newPermissions);
  };

  const handleRemoveMember = (userId: string) => {
    setMemberToRemove(userId);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      removeMember(project.id, memberToRemove);
      setMemberToRemove(null);
    }
    setShowRemoveConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-auto my-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('project.settings')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Users className="w-4 h-4" />
              <span>{t('project.members')}</span>
            </div>
          </button>
          {isOwner && (
            <button
              onClick={() => setActiveTab('invite')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'invite'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Mail className="w-4 h-4" />
                <span>{t('project.invite')}</span>
              </div>
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'members' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800 mb-4">{t('project.members')}</h3>
              
              {project.members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.userId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {t('user')} {member.userId.slice(0, 8)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {member.role === 'admin' ? t('role.admin') : t('role.member')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    {isOwner && member.role !== 'admin' && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <input
                            type="checkbox"
                            checked={member.permissions.canView}
                            onChange={(e) => handlePermissionChange(member.userId, 'canView', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{t('project.permissions.view')}</span>
                        </label>
                        <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <input
                            type="checkbox"
                            checked={member.permissions.canCreateTasks}
                            onChange={(e) => handlePermissionChange(member.userId, 'canCreateTasks', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{t('project.permissions.create')}</span>
                        </label>
                        <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <input
                            type="checkbox"
                            checked={member.permissions.canDeleteTasks}
                            onChange={(e) => handlePermissionChange(member.userId, 'canDeleteTasks', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{t('project.permissions.delete')}</span>
                        </label>
                      </div>
                    )}

                    {isOwner && member.role !== 'admin' && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('member.remove')}
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'invite' && isOwner && (
            <div>
              <h3 className="font-medium text-gray-800 mb-4">{t('project.invite')}</h3>
              
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.invite.name')}
                  </label>
                  <input
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('project.invite.email')}
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('invite')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showRemoveConfirm}
        title={t('member.remove.confirm.title')}
        message={t('member.remove.confirm.message')}
        confirmText={t('member.remove.confirm.yes')}
        cancelText={t('member.remove.confirm.no')}
        onConfirm={confirmRemoveMember}
        onCancel={() => {
          setShowRemoveConfirm(false);
          setMemberToRemove(null);
        }}
        type="danger"
      />
    </div>
  );
}
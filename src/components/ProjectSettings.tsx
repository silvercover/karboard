import React, { useState } from 'react';
import { X, Users, Mail, Shield, Trash2, UserMinus, Edit, Save, Clock, CheckCircle, XCircle, Globe, Lock, ToggleLeft, ToggleRight } from 'lucide-react';
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
  const { inviteUser, updateMemberPermissions, removeMember, updateProject, invitations } = useProject();
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'invite' | 'invitations'>('general');
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [projectDescription, setProjectDescription] = useState(project.description || '');
  const [projectIsPublic, setProjectIsPublic] = useState(project.isPublic);

  if (!isOpen) return null;

  const isOwner = project.ownerId === user?.id;
  const projectInvitations = invitations.filter(inv => inv.projectId === project.id);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;

    await inviteUser(project.id, inviteForm.email.trim(), inviteForm.name.trim());
    setInviteForm({ name: '', email: '' });
    setActiveTab('invitations');
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

  const handleSaveProjectInfo = () => {
    if (projectTitle.trim() !== project.title || 
        projectDescription !== (project.description || '') ||
        projectIsPublic !== project.isPublic) {
      updateProject(project.id, {
        title: projectTitle.trim(),
        description: projectDescription.trim() || undefined,
        isPublic: projectIsPublic
      });
    }
    setIsEditingTitle(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('invitation.pending');
      case 'accepted':
        return t('invitation.accepted');
      case 'rejected':
        return t('invitation.rejected');
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-auto my-auto">
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
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Edit className="w-4 h-4" />
              <span>{t('project.general')}</span>
            </div>
          </button>
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
            <>
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
              <button
                onClick={() => setActiveTab('invitations')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'invitations'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Shield className="w-4 h-4" />
                  <span>{t('project.invitations')}</span>
                  {projectInvitations.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {projectInvitations.length}
                    </span>
                  )}
                </div>
              </button>
            </>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('project.title')}
                </label>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={!isOwner}
                  />
                  {isOwner && (
                    <button
                      onClick={handleSaveProjectInfo}
                      disabled={projectTitle.trim() === project.title && 
                               projectDescription === (project.description || '') &&
                               projectIsPublic === project.isPublic}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 rtl:space-x-reverse"
                    >
                      <Save className="w-4 h-4" />
                      <span>{t('save')}</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('project.description')}
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  disabled={!isOwner}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('project.visibility')}
                </label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {projectIsPublic ? (
                      <>
                        <Globe className="w-5 h-5 text-green-600" />
                        <div>
                          <span className="font-medium">{t('project.public')}</span>
                          <div className="text-sm text-gray-600">{t('project.public.desc')}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-gray-600" />
                        <div>
                          <span className="font-medium">{t('project.private')}</span>
                          <div className="text-sm text-gray-600">{t('project.private.desc')}</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {isOwner && (
                    <button
                      onClick={() => setProjectIsPublic(!projectIsPublic)}
                      className="flex items-center space-x-1 rtl:space-x-reverse text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {projectIsPublic ? (
                        <ToggleRight className="w-8 h-8" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800 mb-4">{t('project.members')}</h3>
              
              {project.members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.userName?.charAt(0).toUpperCase() || member.userId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {member.userName || `${t('user')} ${member.userId.slice(0, 8)}`}
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

          {activeTab === 'invitations' && isOwner && (
            <div>
              <h3 className="font-medium text-gray-800 mb-4">{t('project.invitations')}</h3>
              
              {projectInvitations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('project.no.invitations')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                          {invitation.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{invitation.name}</div>
                          <div className="text-sm text-gray-600">{invitation.email}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(invitation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {getStatusIcon(invitation.status)}
                        <span className={`text-sm font-medium ${
                          invitation.status === 'pending' ? 'text-yellow-600' :
                          invitation.status === 'accepted' ? 'text-green-600' :
                          'text-red-600'
                        }`}>
                          {getStatusText(invitation.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
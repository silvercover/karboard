import React, { useState, useEffect, useRef } from 'react';
import { Plus, Settings, Users, Globe, Lock, ChevronDown, Copy, Check, Edit, Trash2 } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ProjectModal } from './ProjectModal';
import { ProjectSettings } from './ProjectSettings';
import { ConfirmDialog } from './ConfirmDialog';

export function ProjectSelector() {
  const { t } = useLanguage();
  const { projects, currentProject, setCurrentProject, deleteProject } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const generateProjectLink = (projectId: string) => {
    const baseUrl = window.location.origin;
    const shortId = projectId.slice(0, 8);
    return `${baseUrl}/p/${shortId}`;
  };

  const copyProjectLink = async (projectId: string) => {
    const link = generateProjectLink(projectId);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedProjectId(projectId);
      setTimeout(() => setCopiedProjectId(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteConfirm(true);
    setShowDropdown(false);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors min-w-[200px]"
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse flex-1">
                {currentProject?.isPublic ? (
                  <Globe className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-600" />
                )}
                <span className="font-medium truncate">
                  {currentProject?.title || t('project.create')}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 rtl:right-0 rtl:left-auto mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[10001] min-w-[350px] max-w-[400px]">
                {projects.map((project) => (
                  <div key={project.id} className="group">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                      <button
                        onClick={() => {
                          setCurrentProject(project);
                          setShowDropdown(false);
                        }}
                        className={`flex items-center space-x-2 rtl:space-x-reverse flex-1 text-left rtl:text-right min-w-0 ${
                          currentProject?.id === project.id ? 'text-blue-700' : ''
                        }`}
                      >
                        {project.isPublic ? (
                          <Globe className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{project.title}</div>
                          {project.description && (
                            <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {truncateText(project.description, 80)}
                            </div>
                          )}
                        </div>
                      </button>
                      
                      <div className="flex items-center space-x-1 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity ml-2 rtl:mr-2 rtl:ml-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded transition-all"
                          title="Edit project"
                        >
                          <Edit className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyProjectLink(project.id);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded transition-all"
                          title="Copy project link"
                        >
                          {copiedProjectId === project.id ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded transition-all"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <hr className="my-2" />
                
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left rtl:text-right hover:bg-gray-50 transition-colors flex items-center space-x-2 rtl:space-x-reverse text-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('project.create')}</span>
                </button>
              </div>
            )}
          </div>

          {currentProject && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {generateProjectLink(currentProject.id).split('/').pop()}
              </div>
              <button
                onClick={() => copyProjectLink(currentProject.id)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Copy project link"
              >
                {copiedProjectId === currentProject.id ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
            </div>
          )}
        </div>

        {currentProject && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('project.settings')}
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {currentProject.members.length}
              </span>
            </div>
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ProjectModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProject(null);
        }}
        editingProject={editingProject}
      />

      {currentProject && (
        <ProjectSettings
          project={currentProject}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t('project.delete.confirm.title')}
        message={t('project.delete.confirm.message')}
        confirmText={t('project.delete.confirm.yes')}
        cancelText={t('project.delete.confirm.no')}
        onConfirm={confirmDeleteProject}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
        type="danger"
      />
    </div>
  );
}
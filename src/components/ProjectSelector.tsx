import React, { useState } from 'react';
import { Plus, Settings, Users, Globe, Lock, ChevronDown } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ProjectModal } from './ProjectModal';
import { ProjectSettings } from './ProjectSettings';

export function ProjectSelector() {
  const { t } = useLanguage();
  const { projects, currentProject, setCurrentProject } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative">
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
              <div className="absolute top-full left-0 rtl:right-0 rtl:left-auto mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[250px]">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setCurrentProject(project);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left rtl:text-right hover:bg-gray-50 transition-colors flex items-center space-x-2 rtl:space-x-reverse ${
                      currentProject?.id === project.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    {project.isPublic ? (
                      <Globe className="w-4 h-4 text-green-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{project.title}</div>
                      {project.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </button>
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

      {currentProject && (
        <ProjectSettings
          project={currentProject}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
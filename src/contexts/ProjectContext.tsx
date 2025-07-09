import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Invitation } from '../types';
import { useAuth } from './AuthContext';
import { saveProjects, loadProjects, saveInvitations, loadInvitations } from '../utils/storage';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  invitations: Invitation[];
  createProject: (title: string, description?: string, isPublic?: boolean) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  setCurrentProject: (project: Project | null) => void;
  inviteUser: (projectId: string, email: string, name: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => void;
  rejectInvitation: (invitationId: string) => void;
  updateMemberPermissions: (projectId: string, userId: string, permissions: any) => void;
  removeMember: (projectId: string, userId: string) => void;
  canUserAccess: (project: Project, action: 'view' | 'createTasks' | 'deleteTasks') => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Email service simulation
const sendInvitationEmail = async (email: string, projectTitle: string, inviterName: string) => {
  // Get email configuration
  const emailConfig = localStorage.getItem('email-config');
  
  if (!emailConfig) {
    console.warn('No email configuration found. Please configure email settings.');
    return false;
  }

  try {
    const config = JSON.parse(emailConfig);
    
    // Simulate email sending
    console.log('Sending invitation email:', {
      to: email,
      from: config.fromEmail,
      subject: `Invitation to join ${projectTitle}`,
      body: `${inviterName} has invited you to join the project "${projectTitle}". Please log in to accept the invitation.`
    });

    // In a real application, you would use the configured email service here
    // For now, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return false;
  }
};

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    if (user) {
      const loadedProjects = loadProjects();
      const userProjects = loadedProjects.filter(p => 
        p.ownerId === user.id || p.members.some(m => m.userId === user.id)
      );
      setProjects(userProjects);
      
      const loadedInvitations = loadInvitations();
      const userInvitations = loadedInvitations.filter(i => i.email === user.email);
      setInvitations(userInvitations);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      saveProjects(projects);
    }
  }, [projects, user]);

  useEffect(() => {
    saveInvitations(invitations);
  }, [invitations]);

  const createProject = (title: string, description?: string, isPublic: boolean = false): Project => {
    if (!user) throw new Error('User must be authenticated');

    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      description,
      isPublic,
      ownerId: user.id,
      members: [{
        userId: user.id,
        userName: user.name,
        role: 'admin',
        permissions: {
          canView: true,
          canCreateTasks: true,
          canDeleteTasks: true
        },
        joinedAt: new Date()
      }],
      boards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
    
    // Update current project if it's the one being updated
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  const inviteUser = async (projectId: string, email: string, name: string) => {
    if (!user) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const invitation: Invitation = {
      id: crypto.randomUUID(),
      projectId,
      email,
      name,
      invitedBy: user.id,
      status: 'pending',
      createdAt: new Date()
    };

    setInvitations(prev => [...prev, invitation]);

    // Send invitation email
    try {
      const emailSent = await sendInvitationEmail(email, project.title, user.name);
      if (emailSent) {
        console.log('Invitation email sent successfully');
      } else {
        console.warn('Failed to send invitation email');
      }
    } catch (error) {
      console.error('Error sending invitation email:', error);
    }
  };

  const acceptInvitation = (invitationId: string) => {
    if (!user) return;

    const invitation = invitations.find(i => i.id === invitationId);
    if (!invitation) return;

    // Add user to project
    setProjects(prev => prev.map(p => {
      if (p.id === invitation.projectId) {
        return {
          ...p,
          members: [...p.members, {
            userId: user.id,
            userName: user.name,
            role: 'member' as const,
            permissions: {
              canView: true,
              canCreateTasks: true,
              canDeleteTasks: false
            },
            joinedAt: new Date()
          }]
        };
      }
      return p;
    }));

    // Update invitation status
    setInvitations(prev => prev.map(i => 
      i.id === invitationId ? { ...i, status: 'accepted' as const } : i
    ));
  };

  const rejectInvitation = (invitationId: string) => {
    setInvitations(prev => prev.map(i => 
      i.id === invitationId ? { ...i, status: 'rejected' as const } : i
    ));
  };

  const updateMemberPermissions = (projectId: string, userId: string, permissions: any) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          members: p.members.map(m => 
            m.userId === userId ? { ...m, permissions } : m
          )
        };
      }
      return p;
    }));

    // Update current project if it's the one being updated
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? {
        ...prev,
        members: prev.members.map(m => 
          m.userId === userId ? { ...m, permissions } : m
        )
      } : null);
    }
  };

  const removeMember = (projectId: string, userId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          members: p.members.filter(m => m.userId !== userId)
        };
      }
      return p;
    }));

    // Update current project if it's the one being updated
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? {
        ...prev,
        members: prev.members.filter(m => m.userId !== userId)
      } : null);
    }
  };

  const canUserAccess = (project: Project, action: 'view' | 'createTasks' | 'deleteTasks'): boolean => {
    if (!user) return false;
    
    const member = project.members.find(m => m.userId === user.id);
    if (!member) return project.isPublic && action === 'view';

    switch (action) {
      case 'view':
        return member.permissions.canView;
      case 'createTasks':
        return member.permissions.canCreateTasks;
      case 'deleteTasks':
        return member.permissions.canDeleteTasks;
      default:
        return false;
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      invitations,
      createProject,
      updateProject,
      deleteProject,
      setCurrentProject,
      inviteUser,
      acceptInvitation,
      rejectInvitation,
      updateMemberPermissions,
      removeMember,
      canUserAccess
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
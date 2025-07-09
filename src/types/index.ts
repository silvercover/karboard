export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // This will be the IndexedDB reference ID for uploaded files
  uploadProgress?: number;
  isExternal?: boolean; // Flag to indicate if this is an external URL vs IndexedDB reference
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatarRef?: string; // Reference to IndexedDB avatar
  text: string;
  parentId?: string; // For reply functionality
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  labels: string[];
  checklist: ChecklistItem[];
  attachments: FileAttachment[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Language {
  code: 'en' | 'fa';
  name: string;
  direction: 'ltr' | 'rtl';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarRef?: string; // Reference to IndexedDB avatar instead of direct data URL
  createdAt: Date;
}

export interface ProjectMember {
  userId: string;
  userName?: string;
  role: 'admin' | 'member';
  permissions: {
    canView: boolean;
    canCreateTasks: boolean;
    canDeleteTasks: boolean;
  };
  joinedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  ownerId: string;
  members: ProjectMember[];
  boards: Board[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  id: string;
  projectId: string;
  email: string;
  name: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
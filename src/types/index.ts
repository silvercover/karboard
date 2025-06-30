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
  url: string;
  uploadProgress?: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
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
  avatar?: string;
  createdAt: Date;
}

export interface ProjectMember {
  userId: string;
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
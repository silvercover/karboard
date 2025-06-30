import { Board, Project, Invitation } from '../types';

const BOARDS_KEY = 'trello-boards';
const PROJECTS_KEY = 'trello-projects';
const INVITATIONS_KEY = 'trello-invitations';

export function saveBoards(boards: Board[]): void {
  try {
    localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
  } catch (error) {
    console.error('Failed to save boards:', error);
  }
}

export function loadBoards(): Board[] {
  try {
    const stored = localStorage.getItem(BOARDS_KEY);
    if (stored) {
      const boards = JSON.parse(stored);
      return boards.map((board: any) => ({
        ...board,
        createdAt: new Date(board.createdAt),
        updatedAt: new Date(board.updatedAt),
        lists: board.lists.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt),
          cards: list.cards.map((card: any) => ({
            ...card,
            createdAt: new Date(card.createdAt),
            updatedAt: new Date(card.updatedAt),
            dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
            checklist: card.checklist || [],
            attachments: card.attachments || [],
            comments: (card.comments || []).map((comment: any) => ({
              ...comment,
              createdAt: new Date(comment.createdAt),
              updatedAt: new Date(comment.updatedAt)
            }))
          }))
        }))
      }));
    }
  } catch (error) {
    console.error('Failed to load boards:', error);
  }
  return [];
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects:', error);
  }
}

export function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (stored) {
      const projects = JSON.parse(stored);
      return projects.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        members: project.members.map((member: any) => ({
          ...member,
          joinedAt: new Date(member.joinedAt)
        })),
        boards: project.boards.map((board: any) => ({
          ...board,
          createdAt: new Date(board.createdAt),
          updatedAt: new Date(board.updatedAt),
          lists: board.lists?.map((list: any) => ({
            ...list,
            createdAt: new Date(list.createdAt),
            updatedAt: new Date(list.updatedAt),
            cards: list.cards?.map((card: any) => ({
              ...card,
              createdAt: new Date(card.createdAt),
              updatedAt: new Date(card.updatedAt),
              dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
              checklist: card.checklist || [],
              attachments: card.attachments || [],
              comments: (card.comments || []).map((comment: any) => ({
                ...comment,
                createdAt: new Date(comment.createdAt),
                updatedAt: new Date(comment.updatedAt)
              }))
            })) || []
          })) || []
        }))
      }));
    }
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
  return [];
}

export function saveInvitations(invitations: Invitation[]): void {
  try {
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));
  } catch (error) {
    console.error('Failed to save invitations:', error);
  }
}

export function loadInvitations(): Invitation[] {
  try {
    const stored = localStorage.getItem(INVITATIONS_KEY);
    if (stored) {
      const invitations = JSON.parse(stored);
      return invitations.map((invitation: any) => ({
        ...invitation,
        createdAt: new Date(invitation.createdAt)
      }));
    }
  } catch (error) {
    console.error('Failed to load invitations:', error);
  }
  return [];
}
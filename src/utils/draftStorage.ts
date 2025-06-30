// Draft storage utilities for saving user input temporarily
const DRAFT_PREFIX = 'trello-draft-';

export interface CardDraft {
  title: string;
  description: string;
  dueDate?: Date;
  labels: string[];
  checklist: any[];
  attachments: any[];
  comments: any[];
  lastSaved: Date;
}

export function saveDraft(cardId: string, draft: Partial<CardDraft>): void {
  try {
    const existingDraft = loadDraft(cardId);
    const updatedDraft = {
      ...existingDraft,
      ...draft,
      lastSaved: new Date()
    };
    localStorage.setItem(`${DRAFT_PREFIX}${cardId}`, JSON.stringify(updatedDraft));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

export function loadDraft(cardId: string): CardDraft | null {
  try {
    const stored = localStorage.getItem(`${DRAFT_PREFIX}${cardId}`);
    if (stored) {
      const draft = JSON.parse(stored);
      return {
        ...draft,
        dueDate: draft.dueDate ? new Date(draft.dueDate) : undefined,
        lastSaved: new Date(draft.lastSaved)
      };
    }
  } catch (error) {
    console.error('Failed to load draft:', error);
  }
  return null;
}

export function clearDraft(cardId: string): void {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${cardId}`);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

export function hasDraft(cardId: string): boolean {
  return localStorage.getItem(`${DRAFT_PREFIX}${cardId}`) !== null;
}

// Clean up old drafts (older than 7 days)
export function cleanupOldDrafts(): void {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(DRAFT_PREFIX)) {
        try {
          const draft = JSON.parse(localStorage.getItem(key) || '{}');
          const lastSaved = new Date(draft.lastSaved);
          if (lastSaved < sevenDaysAgo) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remove corrupted drafts
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Failed to cleanup old drafts:', error);
  }
}
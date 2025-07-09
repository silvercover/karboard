// IndexedDB utilities for storing large binary data
const DB_NAME = 'TrelloCloneDB';
const DB_VERSION = 1;
const AVATARS_STORE = 'avatars';
const ATTACHMENTS_STORE = 'attachments';

interface DBStores {
  avatars: {
    key: string;
    value: {
      id: string;
      data: string;
      createdAt: Date;
    };
  };
  attachments: {
    key: string;
    value: {
      id: string;
      data: string;
      name: string;
      size: number;
      type: string;
      createdAt: Date;
    };
  };
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create avatars store
        if (!db.objectStoreNames.contains(AVATARS_STORE)) {
          const avatarStore = db.createObjectStore(AVATARS_STORE, { keyPath: 'id' });
          avatarStore.createIndex('createdAt', 'createdAt');
        }

        // Create attachments store
        if (!db.objectStoreNames.contains(ATTACHMENTS_STORE)) {
          const attachmentStore = db.createObjectStore(ATTACHMENTS_STORE, { keyPath: 'id' });
          attachmentStore.createIndex('createdAt', 'createdAt');
        }
      };
    });

    return this.initPromise;
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  async saveAvatar(userId: string, dataUrl: string): Promise<string> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([AVATARS_STORE], 'readwrite');
      const store = transaction.objectStore(AVATARS_STORE);

      const avatarData = {
        id: userId,
        data: dataUrl,
        createdAt: new Date()
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(avatarData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return userId; // Return the ID as reference
    } catch (error) {
      console.error('Failed to save avatar to IndexedDB:', error);
      throw error;
    }
  }

  async getAvatar(userId: string): Promise<string | null> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([AVATARS_STORE], 'readonly');
      const store = transaction.objectStore(AVATARS_STORE);

      return new Promise<string | null>((resolve, reject) => {
        const request = store.get(userId);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get avatar from IndexedDB:', error);
      return null;
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([AVATARS_STORE], 'readwrite');
      const store = transaction.objectStore(AVATARS_STORE);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(userId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to delete avatar from IndexedDB:', error);
    }
  }

  async saveAttachment(id: string, name: string, size: number, type: string, dataUrl: string): Promise<string> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([ATTACHMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(ATTACHMENTS_STORE);

      const attachmentData = {
        id,
        data: dataUrl,
        name,
        size,
        type,
        createdAt: new Date()
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(attachmentData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return id; // Return the ID as reference
    } catch (error) {
      console.error('Failed to save attachment to IndexedDB:', error);
      throw error;
    }
  }

  async getAttachment(id: string): Promise<string | null> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([ATTACHMENTS_STORE], 'readonly');
      const store = transaction.objectStore(ATTACHMENTS_STORE);

      return new Promise<string | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get attachment from IndexedDB:', error);
      return null;
    }
  }

  async deleteAttachment(id: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([ATTACHMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(ATTACHMENTS_STORE);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to delete attachment from IndexedDB:', error);
    }
  }

  async cleanupOldData(daysOld: number = 30): Promise<void> {
    try {
      const db = await this.ensureDB();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Clean up old avatars
      const avatarTransaction = db.transaction([AVATARS_STORE], 'readwrite');
      const avatarStore = avatarTransaction.objectStore(AVATARS_STORE);
      const avatarIndex = avatarStore.index('createdAt');
      const avatarRange = IDBKeyRange.upperBound(cutoffDate);
      avatarIndex.openCursor(avatarRange).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Clean up old attachments
      const attachmentTransaction = db.transaction([ATTACHMENTS_STORE], 'readwrite');
      const attachmentStore = attachmentTransaction.objectStore(ATTACHMENTS_STORE);
      const attachmentIndex = attachmentStore.index('createdAt');
      const attachmentRange = IDBKeyRange.upperBound(cutoffDate);
      attachmentIndex.openCursor(attachmentRange).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.error('Failed to cleanup old data from IndexedDB:', error);
    }
  }
}

// Export singleton instance
export const indexedDBManager = new IndexedDBManager();

// Initialize on module load
indexedDBManager.init().catch(console.error);
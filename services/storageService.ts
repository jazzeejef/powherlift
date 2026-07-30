const DB_NAME = 'PowHerLiftsDB';
const STORE_NAME = 'keyValueStore';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        
        dbInstance.onclose = () => {
          dbInstance = null;
          dbPromise = null;
        };

        dbInstance.onerror = (e) => {
          console.warn('IndexedDB instance error:', e);
        };

        resolve(dbInstance);
      };

      request.onerror = () => {
        dbPromise = null;
        console.warn('IndexedDB open error:', request.error);
        reject(request.error);
      };
    } catch (e) {
      dbPromise = null;
      console.warn('IndexedDB initialization exception:', e);
      reject(e);
    }
  });

  return dbPromise;
}

export const storageService = {
  /**
   * Retrieves an item from IndexedDB, with fallback to localStorage.
   * Also handles migrating localStorage items into IndexedDB.
   */
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const db = await getDB();
      const valueFromIDB = await new Promise<T | undefined>((resolve) => {
        try {
          const transaction = db.transaction(STORE_NAME, 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(key);

          request.onsuccess = () => {
            resolve(request.result as T | undefined);
          };

          request.onerror = () => {
            resolve(undefined);
          };
        } catch {
          resolve(undefined);
        }
      });

      if (valueFromIDB !== undefined && valueFromIDB !== null) {
        return valueFromIDB;
      }

      // Fallback to localStorage if IDB item is missing
      const localString = localStorage.getItem(key);
      if (localString) {
        try {
          const parsed = JSON.parse(localString) as T;
          // Save back into IndexedDB so it's populated for next time
          this.setItem(key, parsed).catch(() => {});
          return parsed;
        } catch {
          return defaultValue;
        }
      }

      return defaultValue;
    } catch (err) {
      console.warn(`[storageService] IndexedDB read failed for "${key}", checking localStorage fallback:`, err);
      const localString = localStorage.getItem(key);
      if (localString) {
        try {
          return JSON.parse(localString) as T;
        } catch {
          return defaultValue;
        }
      }
      return defaultValue;
    }
  },

  /**
   * Immediately saves an item to both IndexedDB and localStorage.
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    // 1. Sync write to localStorage
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[storageService] localStorage write failed for "${key}":`, e);
    }

    // 2. Write to IndexedDB
    try {
      const db = await getDB();
      await new Promise<void>((resolve, reject) => {
        try {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put(value, key);

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      console.warn(`[storageService] IndexedDB write failed for "${key}":`, e);
    }
  },

  /**
   * Exports all user workout, nutrition, weight, and coach data as a JSON file backup.
   */
  async exportAllData(): Promise<void> {
    try {
      const [workouts, nutrition, weight, coachMessages] = await Promise.all([
        this.getItem('powher_workouts', []),
        this.getItem('powher_nutrition_history', []),
        this.getItem('powher_weight_history', []),
        this.getItem('powher_coach_messages', [])
      ]);

      const exportPayload = {
        app: 'PowHER Lifts',
        version: '1.2.0',
        exportedAt: new Date().toISOString(),
        data: {
          workouts,
          nutritionHistory: nutrition,
          weightHistory: weight,
          coachMessages
        }
      };

      const jsonString = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `powher_lifts_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data:', e);
      throw new Error('Could not export backup data');
    }
  },

  /**
   * Imports a backup JSON string and restores all app state into IndexedDB and localStorage.
   */
  async importAllData(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed; // support raw or wrapped format

      if (Array.isArray(data.workouts)) {
        await this.setItem('powher_workouts', data.workouts);
      }
      if (Array.isArray(data.nutritionHistory)) {
        await this.setItem('powher_nutrition_history', data.nutritionHistory);
      }
      if (Array.isArray(data.weightHistory)) {
        await this.setItem('powher_weight_history', data.weightHistory);
      }
      if (Array.isArray(data.coachMessages)) {
        await this.setItem('powher_coach_messages', data.coachMessages);
      }

      return true;
    } catch (e) {
      console.error('Failed to parse or import data:', e);
      return false;
    }
  }
};

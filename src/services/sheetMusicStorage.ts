const DB_NAME = 'BandBuddySheetMusic';
const DB_VERSION = 1;
const STORE_NAME = 'sheetMusic';

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB connection
 */
function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Store sheet music PDF in IndexedDB
 */
export async function storeSheetMusic(songId: string, file: File): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(file, songId);

    request.onerror = () => {
      reject(new Error('Failed to store sheet music'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Retrieve sheet music PDF from IndexedDB
 */
export async function getSheetMusic(songId: string): Promise<File | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(songId);

    request.onerror = () => {
      reject(new Error('Failed to retrieve sheet music'));
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

/**
 * Delete sheet music PDF from IndexedDB
 */
export async function deleteSheetMusic(songId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(songId);

    request.onerror = () => {
      reject(new Error('Failed to delete sheet music'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

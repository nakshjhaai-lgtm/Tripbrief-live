import { DB_NAME, DB_VERSION, STORES } from './schema.js';
let dbPromise;
export function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const [name, indexes] of Object.entries(STORES)) {
        const store = db.objectStoreNames.contains(name) ? req.transaction.objectStore(name) : db.createObjectStore(name, { keyPath: name === 'settings' ? 'key' : 'id' });
        for (const idx of indexes) {
          const indexName = Array.isArray(idx) ? idx.join('_') : idx;
          const keyPath = Array.isArray(idx) && idx.length === 1 ? idx[0] : idx;
          if (store.indexNames.contains(indexName)) {
            const existing = store.index(indexName);
            if (JSON.stringify(existing.keyPath) !== JSON.stringify(keyPath)) store.deleteIndex(indexName);
          }
          if (!store.indexNames.contains(indexName)) store.createIndex(indexName, keyPath, { unique: false });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}
export async function tx(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode); const store = t.objectStore(storeName); let result;
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    result = fn(store);
  });
}
export function request(req) { return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }

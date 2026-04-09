const DB_NAME = 'DataAI_DB';
const STORE_NAME = 'datasets';
const CHAT_STORE = 'chats';
const DB_VERSION = 2;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CHAT_STORE)) {
        db.createObjectStore(CHAT_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const API_BASE = 'http://localhost:8001/api';

export const saveDataset = async (dataset) => {
  // Save to Backend
  try {
    const response = await fetch(`${API_BASE}/datasets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataset)
    });
    if (!response.ok) throw new Error('Failed to save to backend');
  } catch (error) {
    console.error("Backend save failed, falling back to IndexedDB:", error);
  }

  // Backup to IndexedDB
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(dataset);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllDatasets = async () => {
  // Prefer Backend
  try {
    const response = await fetch(`${API_BASE}/datasets`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) return data;
    }
  } catch (error) {
    console.error("Backend fetch failed, falling back to IndexedDB:", error);
  }

  // Fallback to IndexedDB
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteDataset = async (id) => {
  // Delete from Backend
  try {
    await fetch(`${API_BASE}/datasets/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error("Backend delete failed:", error);
  }

  // Delete from IndexedDB
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const saveChatMessage = async (msg) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const interaction = {
      id: Date.now(),
      ...msg // Should include query, response, datasetName, and datasetId
    };
    const transaction = db.transaction(CHAT_STORE, 'readwrite');
    const store = transaction.objectStore(CHAT_STORE);
    const request = store.put(interaction);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getChatHistory = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CHAT_STORE, 'readonly');
    const store = transaction.objectStore(CHAT_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const clearChatHistory = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CHAT_STORE, 'readwrite');
    const store = transaction.objectStore(CHAT_STORE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearLocalStorageQuota = () => {
  localStorage.removeItem('dataai_datasets');
};

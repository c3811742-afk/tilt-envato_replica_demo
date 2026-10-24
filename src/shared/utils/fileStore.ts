// Files the user uploads to their collections, kept in the browser (IndexedDB), since they're too big for localStorage.

const databaseName = 'tilt-files';
const storeName = 'files';

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('File storage is not available in this browser'));
      return;
    }
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open file storage'));
  });

// Runs one request in a transaction and resolves with its result.
const run = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) => {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const request = action(database.transaction(storeName, mode).objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('File storage request failed'));
  });
};

export const fileStore = {
  put: (id: string, file: Blob) => run('readwrite', (store) => store.put(file, id)),
  get: (id: string) => run<Blob | undefined>('readonly', (store) => store.get(id) as IDBRequest<Blob | undefined>),
  remove: (id: string) => run('readwrite', (store) => store.delete(id)),
};

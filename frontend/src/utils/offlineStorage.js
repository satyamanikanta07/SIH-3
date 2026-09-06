/**
 * IndexedDB Offline Storage for NER Smart Logistics Platform.
 * Provides robust offline persistent queuing for Field Reports with attached photos,
 * duplicate prevention, retry management, and synchronization tracking.
 */

const DB_NAME = 'NER_LOGISTICS_OFFLINE_DB';
const DB_VERSION = 1;
const STORE_NAME = 'pending_field_reports';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject(new Error('IndexedDB is not supported in this browser.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'reportId' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store or update a report in the offline IndexedDB queue.
 */
export async function saveOfflineReport(report) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const reportRecord = {
      ...report,
      reportId: report.reportId || `FR-OFF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      syncStatus: 'Pending Sync',
      queuedAt: new Date().toISOString(),
      retryCount: report.retryCount || 0
    };

    const req = store.put(reportRecord);
    req.onsuccess = () => resolve(reportRecord);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve all pending reports awaiting synchronization.
 */
export async function getPendingReports() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove a successfully synced report from the offline queue.
 */
export async function removeSyncedReport(reportId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(reportId);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Increment retry count or update error message on failed sync.
 */
export async function markReportSyncFailed(reportId, errorMessage) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(reportId);

    getReq.onsuccess = () => {
      const record = getReq.result;
      if (record) {
        record.retryCount = (record.retryCount || 0) + 1;
        record.lastError = errorMessage;
        record.lastAttemptAt = new Date().toISOString();
        store.put(record);
      }
      resolve(record);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Count how many reports are currently pending offline.
 */
export async function getPendingReportCount() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.count();

    req.onsuccess = () => resolve(req.result || 0);
    req.onerror = () => reject(req.error);
  });
}

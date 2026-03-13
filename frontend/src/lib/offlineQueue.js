/**
 * Offline Queue Manager
 * ---------------------
 * Stores failed API requests (like attendance marking) in localStorage
 * when the device is offline. Automatically syncs them back when
 * internet connectivity is restored.
 */

const QUEUE_KEY = 'ams_offline_queue';

// Get all queued items
export const getQueue = () => {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Add an item to the offline queue
export const addToQueue = (request) => {
  const queue = getQueue();
  queue.push({
    ...request,
    id: Date.now() + '_' + Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return queue.length;
};

// Remove an item from the queue after successful sync
export const removeFromQueue = (id) => {
  const queue = getQueue();
  const filtered = queue.filter((item) => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
};

// Clear the entire queue
export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

// Sync all queued requests
export const syncQueue = async (axiosInstance) => {
  const queue = getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      if (item.method === 'POST') {
        await axiosInstance.post(item.url, item.data);
      } else if (item.method === 'PUT') {
        await axiosInstance.put(item.url, item.data);
      }
      removeFromQueue(item.id);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
};

// Check if the browser is online
export const isOnline = () => navigator.onLine;

// Get queue count
export const getQueueCount = () => getQueue().length;

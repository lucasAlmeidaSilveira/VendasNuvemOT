// db.js
import { openDB } from 'idb';

export const getDBInstance = async (storeName) => {
  return openDB(storeName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id' });
      }
    }
  });
};

export const saveOrders = async (storeName, orders) => {
  const db = await getDBInstance(storeName);
  const tx = db.transaction('orders', 'readwrite');
  const store = tx.objectStore('orders');
  orders.forEach(order => {
    store.put(order);
  });
  await tx.done;
};

export const getOrders = async (storeName) => {
  const db = await getDBInstance(storeName);
  const tx = db.transaction('orders', 'readonly');
  const store = tx.objectStore('orders');
  return store.getAll();
};

export const getOrderByDateRange = async (storeName, startDateISO, endDateISO) => {
  const db = await getDBInstance(storeName);
  const tx = db.transaction('orders', 'readonly');
  const store = tx.objectStore('orders');
  const allOrders = await store.getAll();
  return allOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= new Date(startDateISO) && orderDate <= new Date(endDateISO);
  });
};

export const clearOrders = async (storeName) => {
  const db = await getDBInstance(storeName);
  const tx = db.transaction('orders', 'readwrite');
  const store = tx.objectStore('orders');
  await store.clear();
  await tx.done;
};

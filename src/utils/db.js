// src/app/utils/db.js
import { openDB } from 'idb';

const DB_NAME = 'CustomerDB';
const STORE_NAME = 'customers';
const DB_VERSION = 1;

// Open or create database
export const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: false });
      }
    },
  });
};

// Add a customer
export const addCustomer = async (customer) => {
  const db = await getDB();
  return db.add(STORE_NAME, customer);
};

// Get all customers
export const getAllCustomers = async () => {
  const db = await getDB();
  return db.getAll(STORE_NAME);
};

// Update a customer
export const updateCustomer = async (id, customer) => {
  const db = await getDB();
  return db.put(STORE_NAME, {...customer, id});
};

// Delete a customer
export const deleteCustomer = async (id) => {
  const db = await getDB();
  return db.delete(STORE_NAME, id);
};

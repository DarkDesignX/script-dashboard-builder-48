import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'database.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create customers table
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating customers table:', err);
          return reject(err);
        }
      });

      // Create scripts table
      db.run(`
        CREATE TABLE IF NOT EXISTS scripts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          command TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL CHECK(category IN ('software', 'sicherheit', 'konfiguration', 'befehl')),
          isGlobal INTEGER NOT NULL DEFAULT 0,
          autoEnrollment INTEGER NOT NULL DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating scripts table:', err);
          return reject(err);
        }
      });

      // Create script_customers junction table
      db.run(`
        CREATE TABLE IF NOT EXISTS script_customers (
          scriptId TEXT,
          customerId TEXT,
          PRIMARY KEY (scriptId, customerId),
          FOREIGN KEY (scriptId) REFERENCES scripts(id) ON DELETE CASCADE,
          FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating script_customers table:', err);
          return reject(err);
        } else {
          console.log('Database tables created successfully');
          resolve();
        }
      });
    });
  });
}

// Helper function to run queries with promises
export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper function to get single row
export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper function to get all rows
export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}
/**
 * SQLite database connection and schema initialization.
 *
 * Runs once at server startup (imported by app.js). Creates tables if they
 * don't exist, enables foreign-key enforcement, and seeds default categories
 * on a fresh database.
 *
 * @module database
 */

import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { countCategories, insertCategory } from '../helpers/queries.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('better-sqlite3').Database} Shared SQLite connection for all routes. */
const db = new Database(path.join(__dirname, 'database.db'));

// Required so DELETE on categories fails when transactions still reference it.
db.pragma('foreign_keys = ON');
db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        color TEXT NOT NULL DEFAULT '#DF00FF'
    );
    
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        FOREIGN KEY(category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    limit_amount REAL NOT NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id),
    UNIQUE(category_id, month)
    );

`);

// Seed starter categories only on first run - avoids duplicates on every restart.
const count = db.prepare(countCategories).get();
if (count.count === 0) {
    const insert = db.prepare(insertCategory);
    insert.run('Salary', 'income', '#2ecc71');
    insert.run('Freelance', 'income', '#1abc9c');
    insert.run('Food', 'expense', '#e74c3c');
    insert.run('Rent', 'expense', '#c0392b');
    insert.run('Transport', 'expense', '#e67e22');
}

export default db;

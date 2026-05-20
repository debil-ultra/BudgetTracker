import Database from "better-sqlite3";

const db = new Database("database.db");

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

const count = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if(count.count === 0) {
    const insert = db.prepare('INSERT INTO categories (name, type, color) VALUES (?, ?, ?)');    
    insert.run('Salary', 'income', '#2ecc71');
    insert.run('Freelance', 'income', '#1abc9c');
    insert.run('Food', 'expense', '#e74c3c');
    insert.run('Rent', 'expense', '#c0392b');
    insert.run('Transport', 'expense', '#e67e22');
}

export default db;

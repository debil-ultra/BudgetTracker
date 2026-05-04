import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
    const { category_id, type, date } = req.query;

    let query = `
        SELECT transactions.*, categories.name as category_name, categories.type as category_type, categories.color as color
        FROM transactions
        JOIN categories ON transactions.category_id = categories.id
    `;

    const params = [];

    if (category_id) {
        query += ' WHERE transactions.category_id = ?';
        params.push(category_id);
    }

    if (type) {
        query += category_id ? ' AND' : ' WHERE';
        query += ' categories.type = ?';
        params.push(type);
    }

    if (date) {
        query += (category_id || type) ? ' AND' : ' WHERE';
        query += ' transactions.date = ?';
        params.push(date);
    }

    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
});

router.get('/:id', (req, res) => {
    const { id } = req.params;

    const transaction = db.prepare(`
        SELECT transactions.*, categories.name as category_name, categories.type as category_type, categories.color as color
        FROM transactions
        JOIN categories ON transactions.category_id = categories.id
        WHERE transactions.id = ?
    `).get(id);

    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
});

router.post('/', (req, res) => {
    const { amount, description, date, category_id } = req.body;

    if (!amount || !date || !category_id) {
        return res.status(400).json({ error: 'Amount, date and category_id are required' });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const result = db.prepare(`
        INSERT INTO transactions (amount, description, date, category_id) 
        VALUES (?, ?, ?, ?)
    `).run(amount, description, date, category_id);

    res.status(201).json({
        id: result.lastInsertRowid,
        amount,
        description,
        date,
        category_id: Number(category_id)
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { amount, description, date, category_id } = req.body;

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    if (!amount || !date || !category_id) {
        return res.status(400).json({ error: 'Amount, date and category_id are required' });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    db.prepare(`
        UPDATE transactions 
        SET amount = ?, description = ?, date = ?, category_id = ?
        WHERE id = ?
    `).run(amount, description, date, category_id, id);

    res.json({
        id: Number(id),
        amount,
        description,
        date,
        category_id: Number(category_id)
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);

    res.json({ message: 'Transaction deleted successfully' });
});

export default router;
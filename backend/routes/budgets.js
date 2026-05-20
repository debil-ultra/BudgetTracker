import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
    const { month, category_id } = req.query;

    let query = `
        SELECT budgets.*, categories.name as category_name, categories.color as color,
            COALESCE(SUM(transactions.amount), 0) as spent
        FROM budgets
        JOIN categories ON budgets.category_id = categories.id
        LEFT JOIN transactions ON transactions.category_id = budgets.category_id
            AND strftime('%Y-%m', transactions.date) = budgets.month
    `;

    const params = [];
    const conditions = [];

    if (month) {
        conditions.push('budgets.month = ?');
        params.push(month);
    }

    if (category_id) {
        conditions.push('budgets.category_id = ?');
        params.push(category_id);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY budgets.id ORDER BY budgets.month DESC';

    const budgets = db.prepare(query).all(...params);
    res.json(budgets);
});

router.get('/:id', (req, res) => {
    const { id } = req.params;

    const budget = db.prepare(`
        SELECT budgets.*, categories.name as category_name, categories.color as color,
            COALESCE(SUM(transactions.amount), 0) as spent
        FROM budgets
        JOIN categories ON budgets.category_id = categories.id
        LEFT JOIN transactions ON transactions.category_id = budgets.category_id
            AND strftime('%Y-%m', transactions.date) = budgets.month
        WHERE budgets.id = ?
        GROUP BY budgets.id
    `).get(id);

    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }

    res.json(budget);
});

router.post('/', (req, res) => {
    const { category_id, month, limit_amount } = req.body;

    if (!category_id || !month || !limit_amount) {
        return res.status(400).json({ error: 'category_id, month and limit_amount are required' });
    }

    if (isNaN(limit_amount) || limit_amount <= 0) {
        return res.status(400).json({ error: 'limit_amount must be a positive number' });
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'month must be in YYYY-MM format' });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const existing = db.prepare('SELECT * FROM budgets WHERE category_id = ? AND month = ?').get(category_id, month);
    if (existing) {
        return res.status(409).json({ error: 'A budget for this category and month already exists' });
    }

    const result = db.prepare('INSERT INTO budgets (category_id, month, limit_amount) VALUES (?, ?, ?)')
        .run(category_id, month, limit_amount);

    res.status(201).json({ id: result.lastInsertRowid, category_id: Number(category_id), month, limit_amount });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { category_id, month, limit_amount } = req.body;

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }

    if (!category_id || !month || !limit_amount) {
        return res.status(400).json({ error: 'category_id, month and limit_amount are required' });
    }

    if (isNaN(limit_amount) || limit_amount <= 0) {
        return res.status(400).json({ error: 'limit_amount must be a positive number' });
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'month must be in YYYY-MM format' });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const existing = db.prepare('SELECT * FROM budgets WHERE category_id = ? AND month = ? AND id != ?').get(category_id, month, id);
    if (existing) {
        return res.status(409).json({ error: 'A budget for this category and month already exists' });
    }

    db.prepare('UPDATE budgets SET category_id = ?, month = ?, limit_amount = ? WHERE id = ?')
        .run(category_id, month, limit_amount, id);

    res.json({ id: Number(id), category_id: Number(category_id), month, limit_amount });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }

    db.prepare('DELETE FROM budgets WHERE id = ?').run(id);

    res.json({ message: 'Budget deleted successfully' });
});

export default router;
import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
    const { type } = req.query;

    let query = 'SELECT * FROM categories';
    const params = [];

    if (type) {
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ error: 'Type must be income or expense' });
        }
        query += ' WHERE type = ?';
        params.push(type);
    }

    const categories = db.prepare(query).all(...params);
    res.json(categories);
});

router.get('/:id', (req, res) => {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found.' });
    }
    res.json(category);
});

router.post('/', (req, res) => {
    const { name, type, color } = req.body;

    if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
    }

    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Type must be income or expense' });
    }

    const categoryColor = color || (type === 'income' ? '#2ecc71' : '#e74c3c');

    const result = db.prepare('INSERT INTO categories (name, type, color) VALUES (?, ?, ?)')
        .run(name, type, categoryColor);

    res.status(201).json({ id: result.lastInsertRowid, name, type, color: categoryColor });
});

router.put('/:id', (req, res) => {
    const { name, type, color } = req.body;
    const { id } = req.params;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
    }

    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Type must be income or expense' });
    }

    const categoryColor = color || category.color;

    db.prepare('UPDATE categories SET name = ?, type = ?, color = ? WHERE id = ?')
        .run(name, type, categoryColor, id);

    res.json({ id: Number(id), name, type, color: categoryColor });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    try {
        db.prepare('DELETE FROM categories WHERE id = ?').run(id);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(409).json({ error: 'Cannot delete category that still has transactions' });
    }
});

export default router;
/**
 * Transaction routes. Transactions are always joined with their category so
 * responses include `category_name`, `category_type`, and `color`.
 *
 * @module routes/transactions
 */

import { Router } from 'express';
import db from '../database/seed.js';
import { validateTransactionBody } from '../helpers/validators.js';
import { sendValidationError } from '../helpers/response.js';
import { asyncHandler } from '../helpers/errorHandler.js';
import {
    selectTransactionsWithCategory,
    getTransactionById,
    getTransactionByIdOnly,
    getCategoryById,
    insertTransaction,
    updateTransaction,
    deleteTransaction
} from '../helpers/queries.js';

const router = Router();

/**
 * GET /transactions
 *
 * Returns transactions with category details. Builds the WHERE clause
 * dynamically from optional query params:
 * - `category_id` — filter by category
 * - `type` — filter by category type (`income` or `expense`)
 * - `date` — exact date match (YYYY-MM-DD)
 *
 * Filters are ANDed together; the first filter adds WHERE, later ones add AND.
 */
router.get('/', asyncHandler((req, res) => {
    const { category_id, type, date } = req.query;
    let query = selectTransactionsWithCategory;
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
}));

router.get('/:id', asyncHandler((req, res) => {
    const { id } = req.params;
    const transaction = db.prepare(getTransactionById).get(id);
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
}));

router.post('/', asyncHandler((req, res) => {
    const { amount, description, date, category_id } = req.body;
    const validationError = validateTransactionBody({ amount, date, category_id });
    if (validationError) {
        return sendValidationError(res, validationError);
    }

    const category = db.prepare(getCategoryById).get(category_id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const result = db.prepare(insertTransaction).run(amount, description, date, category_id);
    res.status(201).json({
        id: result.lastInsertRowid,
        amount,
        description,
        date,
        category_id: Number(category_id)
    });
}));

router.put('/:id', asyncHandler((req, res) => {
    const { id } = req.params;
    const { amount, description, date, category_id } = req.body;
    const transaction = db.prepare(getTransactionByIdOnly).get(id);
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    const validationError = validateTransactionBody({ amount, date, category_id });
    if (validationError) {
        return sendValidationError(res, validationError);
    }

    const category = db.prepare(getCategoryById).get(category_id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    db.prepare(updateTransaction).run(amount, description, date, category_id, id);
    res.json({
        id: Number(id),
        amount,
        description,
        date,
        category_id: Number(category_id)
    });
}));

router.delete('/:id', asyncHandler((req, res) => {
    const { id } = req.params;
    const transaction = db.prepare(getTransactionByIdOnly).get(id);
    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    db.prepare(deleteTransaction).run(id);
    res.json({ message: 'Transaction deleted successfully' });
}));

export default router;

/**
 * Budget routes. Each budget ties a spending limit to one category for a
 * given month (YYYY-MM). List/detail endpoints also compute how much has
 * been spent by summing matching transactions in that month.
 *
 * @module routes/budgets
 */

import { Router } from 'express';
import db from '../database/seed.js';
import { validateBudgetBody } from '../helpers/validators.js';
import { sendValidationError } from '../helpers/response.js';
import { asyncHandler } from '../helpers/errorHandler.js';
import {
    selectBudgetsWithSpent,
    getBudgetById,
    getBudgetByIdOnly,
    getCategoryById,
    getBudgetByCategoryAndMonth,
    getBudgetByCategoryAndMonthExcludingId,
    insertBudget,
    updateBudget,
    deleteBudget
} from '../helpers/queries.js';

const router = Router();

/**
 * GET /budgets
 *
 * Returns budgets with category info and a computed `spent` total.
 * Optional query params: `month` (YYYY-MM), `category_id`.
 *
 * The spent amount comes from a LEFT JOIN on transactions where the
 * transaction date falls in the same year-month as the budget
 * (`strftime('%Y-%m', transactions.date) = budgets.month`).
 */
router.get('/', asyncHandler((req, res) => {
    const { month, category_id } = req.query;
    let query = selectBudgetsWithSpent;
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
}));

/** GET /budgets/:id — single budget with the same spent calculation as the list endpoint. */
router.get('/:id', asyncHandler((req, res) => {
    const { id } = req.params;
    const budget = db.prepare(getBudgetById).get(id);
    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(budget);
}));

/**
 * POST /budgets
 *
 * Creates a budget. Rejects duplicate category+month pairs (409) and
 * validates that month is YYYY-MM and limit_amount is a positive number.
 */
router.post('/', asyncHandler((req, res) => {
    const { category_id, month, limit_amount } = req.body;
    const validationError = validateBudgetBody({ category_id, month, limit_amount });
    if (validationError) {
        return sendValidationError(res, validationError);
    }

    const category = db.prepare(getCategoryById).get(category_id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const existing = db.prepare(getBudgetByCategoryAndMonth).get(category_id, month);
    if (existing) {
        return res.status(409).json({ error: 'A budget for this category and month already exists' });
    }

    const result = db.prepare(insertBudget).run(category_id, month, limit_amount);
    res.status(201).json({ id: result.lastInsertRowid, category_id: Number(category_id), month, limit_amount });
}));

/**
 * PUT /budgets/:id
 *
 * Updates a budget. Same validation as POST, but allows keeping the same
 * category+month on the record being edited (checks duplicates with `id != ?`).
 */
router.put('/:id', asyncHandler((req, res) => {
    const { id } = req.params;
    const { category_id, month, limit_amount } = req.body;
    const budget = db.prepare(getBudgetByIdOnly).get(id);
    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }

    const validationError = validateBudgetBody({ category_id, month, limit_amount });
    if (validationError) {
        return sendValidationError(res, validationError);
    }

    const category = db.prepare(getCategoryById).get(category_id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const existing = db.prepare(getBudgetByCategoryAndMonthExcludingId).get(category_id, month, id);
    if (existing) {
        return res.status(409).json({ error: 'A budget for this category and month already exists' });
    }

    db.prepare(updateBudget).run(category_id, month, limit_amount, id);
    res.json({ id: Number(id), category_id: Number(category_id), month, limit_amount });
}));

router.delete('/:id', asyncHandler((req, res) => {
    const { id } = req.params;
    const budget = db.prepare(getBudgetByIdOnly).get(id);
    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }

    db.prepare(deleteBudget).run(id);
    res.json({ message: 'Budget deleted successfully' });
}));

export default router;

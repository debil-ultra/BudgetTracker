/**
 * Category routes. Categories are either `income` or `expense` and are
 * referenced by transactions and budgets via foreign keys.
 *
 * @module routes/categories
 */

import { Router } from 'express';
import db from '../database/seed.js';
import {
    validateCategoryType,
    validateCategoryBody,
    getDefaultCategoryColor
} from '../helpers/validators.js';
import { sendValidationError } from '../helpers/response.js';
import { asyncHandler } from '../helpers/errorHandler.js';
import {
    getAllCategories,
    getCategoryById,
    insertCategory,
    updateCategory,
    deleteCategory
} from '../helpers/queries.js';

const router = Router();

router.get('/', asyncHandler((req, res) => {
    const { type } = req.query;
    let query = getAllCategories;
    const params = [];

    if (type) {
        const validationError = validateCategoryType(type);
        if (validationError) {
            return sendValidationError(res, validationError);
        }
        query += ' WHERE type = ?';
        params.push(type);
    }

    const categories = db.prepare(query).all(...params);
    res.json(categories);
}));

router.get('/:id', asyncHandler((req, res) => {
    const category = db.prepare(getCategoryById).get(req.params.id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found.' });
    }
    res.json(category);
}));

/**
 * POST /categories
 *
 * Creates a category. If no color is sent, picks a default based on type
 * (green for income, red for expense).
 */
router.post('/', asyncHandler((req, res) => {
    const { name, type, color } = req.body;
    const validationError = validateCategoryBody({ name, type });
    if (validationError) {
        return sendValidationError(res, validationError);
    }

    const categoryColor = color || getDefaultCategoryColor(type);
    const result = db.prepare(insertCategory).run(name, type, categoryColor);
    res.status(201).json({ id: result.lastInsertRowid, name, type, color: categoryColor });
}));

router.put('/:id', asyncHandler((req, res) => {
    const { name, type, color } = req.body;
    const { id } = req.params;
    const category = db.prepare(getCategoryById).get(id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const validationError = validateCategoryBody({ name, type });
    if (validationError) {
        return sendValidationError(res, validationError);
    }

    const categoryColor = color || category.color;
    db.prepare(updateCategory).run(name, type, categoryColor, id);
    res.json({ id: Number(id), name, type, color: categoryColor });
}));

/**
 * DELETE /categories/:id
 *
 * Deletes a category. Returns 409 if the category still has linked
 * transactions — SQLite raises a foreign-key error because
 * `foreign_keys = ON` is enabled in the database module.
 */
router.delete('/:id', asyncHandler((req, res) => {
    const { id } = req.params;
    const category = db.prepare(getCategoryById).get(id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    try {
        db.prepare(deleteCategory).run(id);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
            return res.status(409).json({ error: 'Cannot delete category that still has transactions' });
        }
        throw err;
    }
}));

export default router;

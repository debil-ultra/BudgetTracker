/**
 * Input validation helpers for API request bodies and query params.
 *
 * Each validator returns `null` when valid, or `{ error: string }` when invalid.
 * Routes use the error message to send a 400 response.
 *
 * @module helpers/validators
 */

const CATEGORY_TYPES = ['income', 'expense'];

const DEFAULT_CATEGORY_COLORS = {
    income: '#2ecc71',
    expense: '#e74c3c'
};

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

/**
 * @typedef {Object} ValidationError
 * @property {string} error - Human-readable validation message
 */

/**
 * @param {string} type
 * @returns {ValidationError|null}
 */
export function validateCategoryType(type) {
    if (!CATEGORY_TYPES.includes(type)) {
        return { error: 'Type must be income or expense' };
    }
    return null;
}

/**
 * Validates the body for POST /categories and PUT /categories/:id.
 *
 * @param {{ name?: string, type?: string }} body
 * @returns {ValidationError|null}
 */
export function validateCategoryBody({ name, type }) {
    if (!name || !type) {
        return { error: 'Name and type are required' };
    }
    return validateCategoryType(type);
}

/**
 * Picks the default hex color when the client does not send one.
 *
 * @param {'income'|'expense'} type
 * @returns {string}
 */
export function getDefaultCategoryColor(type) {
    return DEFAULT_CATEGORY_COLORS[type] || DEFAULT_CATEGORY_COLORS.income;
}

/**
 * @param {number|string} value
 * @param {string} fieldName - Used in the error message (e.g. "Amount")
 * @returns {ValidationError|null}
 */
export function validatePositiveNumber(value, fieldName) {
    if (value === undefined || value === null || value === '' || isNaN(value) || Number(value) <= 0) {
        return { error: `${fieldName} must be a positive number` };
    }
    return null;
}

/**
 * Validates the body for POST /transactions and PUT /transactions/:id.
 *
 * @param {{ amount?: number, date?: string, category_id?: number }} body
 * @returns {ValidationError|null}
 */
export function validateTransactionBody({ amount, date, category_id }) {
    if (!amount || !date || !category_id) {
        return { error: 'Amount, date and category_id are required' };
    }
    return validatePositiveNumber(amount, 'Amount');
}

/**
 * Validates the body for POST /budgets and PUT /budgets/:id.
 *
 * @param {{ category_id?: number, month?: string, limit_amount?: number }} body
 * @returns {ValidationError|null}
 */
export function validateBudgetBody({ category_id, month, limit_amount }) {
    if (!category_id || !month || limit_amount === undefined || limit_amount === null || limit_amount === '') {
        return { error: 'category_id, month and limit_amount are required' };
    }

    const amountError = validatePositiveNumber(limit_amount, 'limit_amount');
    if (amountError) {
        return amountError;
    }

    if (!MONTH_PATTERN.test(month)) {
        return { error: 'month must be in YYYY-MM format' };
    }

    return null;
}

/**
 * Centralized SQL query strings used across route handlers.
 *
 * @module helpers/queries
 */

// Categories
export const getAllCategories = 'SELECT * FROM categories';
export const getCategoryById = 'SELECT * FROM categories WHERE id = ?';
export const insertCategory = 'INSERT INTO categories (name, type, color) VALUES (?, ?, ?)';
export const updateCategory = 'UPDATE categories SET name = ?, type = ?, color = ? WHERE id = ?';
export const deleteCategory = 'DELETE FROM categories WHERE id = ?';
export const countCategories = 'SELECT COUNT(*) as count FROM categories';

// Transactions
export const selectTransactionsWithCategory = `
    SELECT transactions.*, categories.name as category_name, categories.type as category_type, categories.color as color
    FROM transactions
    JOIN categories ON transactions.category_id = categories.id
`;

export const getTransactionById = `${selectTransactionsWithCategory} WHERE transactions.id = ?`;
export const getTransactionByIdOnly = 'SELECT * FROM transactions WHERE id = ?';
export const insertTransaction = 'INSERT INTO transactions (amount, description, date, category_id) VALUES (?, ?, ?, ?)';
export const updateTransaction = 'UPDATE transactions SET amount = ?, description = ?, date = ?, category_id = ? WHERE id = ?';
export const deleteTransaction = 'DELETE FROM transactions WHERE id = ?';

// Budgets
export const selectBudgetsWithSpent = `
    SELECT budgets.*, categories.name as category_name, categories.color as color,
        COALESCE(SUM(transactions.amount), 0) as spent
    FROM budgets
    JOIN categories ON budgets.category_id = categories.id
    LEFT JOIN transactions ON transactions.category_id = budgets.category_id
        AND strftime('%Y-%m', transactions.date) = budgets.month
`;

export const getBudgetById = `${selectBudgetsWithSpent} WHERE budgets.id = ? GROUP BY budgets.id`;
export const getBudgetByIdOnly = 'SELECT * FROM budgets WHERE id = ?';
export const getBudgetByCategoryAndMonth = 'SELECT * FROM budgets WHERE category_id = ? AND month = ?';
export const getBudgetByCategoryAndMonthExcludingId = 'SELECT * FROM budgets WHERE category_id = ? AND month = ? AND id != ?';
export const insertBudget = 'INSERT INTO budgets (category_id, month, limit_amount) VALUES (?, ?, ?)';
export const updateBudget = 'UPDATE budgets SET category_id = ?, month = ?, limit_amount = ? WHERE id = ?';
export const deleteBudget = 'DELETE FROM budgets WHERE id = ?';

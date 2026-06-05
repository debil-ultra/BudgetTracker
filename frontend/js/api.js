document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('click', () => {
            try { input.showPicker(); } catch (e) {}
        });
    });
});

document.querySelectorAll('input[type="date"]').forEach(input => {
    input.addEventListener('click', () => {
        try { input.showPicker(); } catch (e) {}
    });
});

/**
 * Base URL for the REST API. Uses localhost during development and the
 * deployed Render URL in production (same origin would not reach the backend).
 * @type {string}
 */
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://budgettracker-woxx.onrender.com';

/**
 * Sends a JSON request to the API and parses the JSON response.
 * Throws an Error with the server's `error` message when the status is not ok.
 *
 * @param {string} endpoint - Path starting with `/`, e.g. `/transactions`
 * @param {string} [method='GET'] - HTTP method
 * @param {object|null} [body=null] - Request body for POST/PUT (serialized to JSON)
 * @returns {Promise<object|object[]>} Parsed response body
 */
async function request(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Something went wrong');
        }

        return await response.json();
}

export const categoriesAPI = {
    getAll: () => request('/categories'),
    getOne: (id) => request(`/categories/${id}`),
    create: (data) => request('/categories', 'POST', data),
    update: (id, data) => request(`/categories/${id}`, 'PUT', data),
    delete: (id) => request(`/categories/${id}`, 'DELETE')
};

/** @typedef {Object} TransactionFilters
 * @property {string} [category_id]
 * @property {string} [type] - `income` or `expense`
 * @property {string} [date] - YYYY-MM-DD
 */

/** @typedef {Object} BudgetFilters
 * @property {string} [month] - YYYY-MM
 * @property {string} [category_id]
 */

export const transactionsAPI = {
    /** @param {TransactionFilters} [filters] */
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        const query = params.toString() ? `?${params.toString()}` : '';
        return request(`/transactions${query}`);
    },
    getOne: (id) => request(`/transactions/${id}`),
    create: (data) => request('/transactions', 'POST', data),
    update: (id, data) => request(`/transactions/${id}`, 'PUT', data),
    delete: (id) => request(`/transactions/${id}`, 'DELETE')
};

export const budgetsAPI = {
    /** @param {BudgetFilters} [filters] */
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        const query = params.toString() ? `?${params.toString()}` : '';
        return request(`/budgets${query}`);
    },
    getOne: (id) => request(`/budgets/${id}`),
    create: (data) => request('/budgets', 'POST', data),
    update: (id, data) => request(`/budgets/${id}`, 'PUT', data),
    delete: (id) => request(`/budgets/${id}`, 'DELETE')
};
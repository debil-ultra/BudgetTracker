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

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://budgettracker-woxx.onrender.com';


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

export const transactionsAPI = {
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
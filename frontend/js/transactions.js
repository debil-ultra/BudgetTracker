import { transactionsAPI, categoriesAPI } from './api.js';

let editingId = null;

async function loadCategories() {
    try {
        const categories = await categoriesAPI.getAll();
        const select = document.getElementById('category');

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadTransactions(filters = {}) {
    try {
        const transactions = await transactionsAPI.getAll(filters);
        renderTransactions(transactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

function renderTransactions(transactions) {
    const tbody = document.getElementById('transactions-body');

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No transactions found</td></tr>`;
        return;
    }

    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${transaction.date}</td>
            <td>${transaction.description || '-'}</td>
            <td>
                <span class="badge" style="background-color: ${transaction.color}">
                    ${transaction.category_name}
                </span>
            </td>
            <td class="amount-${transaction.category_type}">
                ${transaction.category_type === 'income' ? '+' : '-'}€${transaction.amount.toFixed(2)}
            </td>
            <td>
                <button class="btn-edit" onclick="startEdit(${transaction.id})">Edit</button>
                <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
        await transactionsAPI.delete(id);
        await loadTransactions();
    } catch (error) {
        alert(error.message);
    }
}

async function startEdit(id) {
    try {
        const transaction = await transactionsAPI.getOne(id);

        editingId = id;
        document.getElementById('transaction-id').value = id;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('description').value = transaction.description || '';
        document.getElementById('date').value = transaction.date;
        document.getElementById('category').value = transaction.category_id;

        document.getElementById('form-title').textContent = 'Edit Transaction';
        document.getElementById('btn-submit').textContent = 'Update Transaction';
        document.getElementById('btn-cancel').classList.remove('hidden');

        document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        alert(error.message);
    }
}

function cancelEdit() {
    editingId = null;
    document.getElementById('transaction-form').reset();
    document.getElementById('form-title').textContent = 'Add Transaction';
    document.getElementById('btn-submit').textContent = 'Add Transaction';
    document.getElementById('btn-cancel').classList.add('hidden');
}

function validateForm(amount, date, categoryId) {
    let valid = true;

    if (!amount || isNaN(amount) || amount <= 0) {
        document.getElementById('amount').classList.add('error');
        valid = false;
    } else {
        document.getElementById('amount').classList.remove('error');
    }

    if (!date) {
        document.getElementById('date').classList.add('error');
        valid = false;
    } else {
        document.getElementById('date').classList.remove('error');
    }

    if (!categoryId) {
        document.getElementById('category').classList.add('error');
        valid = false;
    } else {
        document.getElementById('category').classList.remove('error');
    }

    return valid;
}

document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim();
    const date = document.getElementById('date').value;
    const category_id = document.getElementById('category').value;

    if (!validateForm(amount, date, category_id)) return;

    const data = { amount, description, date, category_id };

    try {
        if (editingId) {
            await transactionsAPI.update(editingId, data);
        } else {
            await transactionsAPI.create(data);
        }

        cancelEdit();
        await loadTransactions();

    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('btn-cancel').addEventListener('click', cancelEdit);

document.getElementById('btn-filter').addEventListener('click', () => {
    const filters = {};

    const type = document.getElementById('filter-type').value;
    const date = document.getElementById('filter-date').value;

    if (type) filters.type = type;
    if (date) filters.date = date;

    loadTransactions(filters);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-date').value = '';
    loadTransactions();
});

loadCategories();
loadTransactions();

window.startEdit = startEdit;
window.deleteTransaction = deleteTransaction;
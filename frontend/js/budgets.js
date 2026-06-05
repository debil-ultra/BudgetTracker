import { budgetsAPI, categoriesAPI } from './api.js';

let editingId = null;

async function loadCategories() {
    try {
        const categories = await categoriesAPI.getAll({ type: 'expense' });
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

async function loadBudgets(filters = {}) {
    try {
        const budgets = await budgetsAPI.getAll(filters);
        renderBudgets(budgets);
    } catch (error) {
        console.error('Error loading budgets:', error);
    }
}

/**
 * Renders the budgets table with a progress bar per row.
 *
 * `spent` comes from the API (sum of transactions in that category/month).
 * Progress is capped at 100% for the bar width, but the label still shows
 * when a budget is over limit.
 *
 * @param {object[]} budgets - Rows with `spent`, `limit_amount`, `month`, `category_name`, `color`
 */
function renderBudgets(budgets) {
    const tbody = document.getElementById('budgets-body');

    if (budgets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No budgets found</td></tr>`;
        return;
    }

    tbody.innerHTML = budgets.map(budget => {
        const percentage = Math.min((budget.spent / budget.limit_amount) * 100, 100).toFixed(1);
        const isOver = budget.spent > budget.limit_amount;
        const progressColor = isOver ? '#e74c3c' : '#2ecc71';

        return `
            <tr>
                <td>${budget.month}</td>
                <td>
                    <span class="badge" style="background-color: ${budget.color}">
                        ${budget.category_name}
                    </span>
                </td>
                <td>€${budget.limit_amount.toFixed(2)}</td>
                <td class="${isOver ? 'amount-expense' : ''}">€${budget.spent.toFixed(2)}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%; background-color: ${progressColor}"></div>
                    </div>
                    <span class="progress-label ${isOver ? 'over-budget' : ''}">${percentage}%${isOver ? ' — over budget!' : ''}</span>
                </td>
                <td>
                    <button class="btn-edit" onclick="startEdit(${budget.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteBudget(${budget.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteBudget(id) {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
        await budgetsAPI.delete(id);
        await loadBudgets();
    } catch (error) {
        alert(error.message);
    }
}

async function startEdit(id) {
    try {
        const budget = await budgetsAPI.getOne(id);

        editingId = id;
        document.getElementById('budget-id').value = id;
        document.getElementById('category').value = budget.category_id;
        document.getElementById('month').value = budget.month;
        document.getElementById('limit_amount').value = budget.limit_amount;

        document.getElementById('form-title').textContent = 'Edit Budget';
        document.getElementById('btn-submit').textContent = 'Update Budget';
        document.getElementById('btn-cancel').classList.remove('hidden');

        document.getElementById('budget-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert(error.message);
    }
}

function cancelEdit() {
    editingId = null;
    document.getElementById('budget-form').reset();
    document.getElementById('form-title').textContent = 'Add Budget';
    document.getElementById('btn-submit').textContent = 'Add Budget';
    document.getElementById('btn-cancel').classList.add('hidden');
}

/**
 * Client-side validation for the budget form.
 *
 * @param {string} categoryId
 * @param {string} month - YYYY-MM from the month input
 * @param {number} limitAmount
 * @returns {boolean} True when all fields are valid
 */
function validateForm(categoryId, month, limitAmount) {
    let valid = true;

    if (!categoryId) {
        document.getElementById('category').classList.add('error');
        valid = false;
    } else {
        document.getElementById('category').classList.remove('error');
    }

    if (!month) {
        document.getElementById('month').classList.add('error');
        valid = false;
    } else {
        document.getElementById('month').classList.remove('error');
    }

    if (!limitAmount || isNaN(limitAmount) || limitAmount <= 0) {
        document.getElementById('limit_amount').classList.add('error');
        valid = false;
    } else {
        document.getElementById('limit_amount').classList.remove('error');
    }

    return valid;
}

document.getElementById('budget-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const category_id = document.getElementById('category').value;
    const month = document.getElementById('month').value;
    const limit_amount = parseFloat(document.getElementById('limit_amount').value);

    if (!validateForm(category_id, month, limit_amount)) return;

    const data = { category_id, month, limit_amount };

    try {
        if (editingId) {
            await budgetsAPI.update(editingId, data);
        } else {
            await budgetsAPI.create(data);
        }

        cancelEdit();
        await loadBudgets();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('btn-cancel').addEventListener('click', cancelEdit);

document.getElementById('btn-filter').addEventListener('click', () => {
    const filters = {};
    const month = document.getElementById('filter-month').value;
    if (month) filters.month = month;
    loadBudgets(filters);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('filter-month').value = '';
    loadBudgets();
});

loadCategories();
loadBudgets();

window.startEdit = startEdit;
window.deleteBudget = deleteBudget;
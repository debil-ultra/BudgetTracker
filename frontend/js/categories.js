import { categoriesAPI } from './api.js';

let editingId = null;

async function loadCategories() {
    try {
        const categories = await categoriesAPI.getAll();

        const income = categories.filter(c => c.type === 'income');
        const expense = categories.filter(c => c.type === 'expense');

        renderCategories(income, 'income-categories-body');
        renderCategories(expense, 'expense-categories-body');

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderCategories(categories, tbodyId) {
    const tbody = document.getElementById(tbodyId);

    if (categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3">No categories yet</td></tr>`;
        return;
    }

    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>
                <span class="badge" style="background-color: ${category.color}">
                    ${category.name}
                </span>
            </td>
            <td>${category.type}</td>
            <td>
                <button class="btn-edit" onclick="startEdit(${category.id})">Edit</button>
                <button class="btn-delete" onclick="deleteCategory(${category.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
        await categoriesAPI.delete(id);
        await loadCategories();
    } catch (error) {
        alert(error.message);
    }
}

async function startEdit(id) {
    try {
        const category = await categoriesAPI.getOne(id);

        editingId = id;
        document.getElementById('category-id').value = id;
        document.getElementById('name').value = category.name;
        document.getElementById('type').value = category.type;

        document.getElementById('form-title').textContent = 'Edit Category';
        document.getElementById('btn-submit').textContent = 'Update Category';
        document.getElementById('btn-cancel').classList.remove('hidden');

    } catch (error) {
        alert(error.message);
    }
}

function cancelEdit() {
    editingId = null;
    document.getElementById('category-form').reset();
    document.getElementById('form-title').textContent = 'Add Category';
    document.getElementById('btn-submit').textContent = 'Add Category';
    document.getElementById('btn-cancel').classList.add('hidden');
}

document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const type = document.getElementById('type').value;

    if (!name) {
        document.getElementById('name').classList.add('error');
        return;
    }

    document.getElementById('name').classList.remove('error');

    const data = { name, type };

    try {
        if (editingId) {
            await categoriesAPI.update(editingId, data);
        } else {
            await categoriesAPI.create(data);
        }

        cancelEdit();
        await loadCategories();

    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('btn-cancel').addEventListener('click', cancelEdit);

loadCategories();

window.startEdit = startEdit;
window.deleteTransaction = deleteTransaction;
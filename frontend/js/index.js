import { transactionsAPI } from './api.js';

/**
 * Fetches all transactions and updates the dashboard summary cards,
 * recent-transactions table, and income/expense charts.
 */
async function loadDashboard() {
    try {
        const transactions = await transactionsAPI.getAll();

        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach(transaction => {
            if (transaction.category_type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += transaction.amount;
            }
        });

        const balance = totalIncome - totalExpenses;

        document.getElementById('total-income').textContent = `€${totalIncome.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `€${totalExpenses.toFixed(2)}`;
        document.getElementById('balance').textContent = `€${balance.toFixed(2)}`;

        document.getElementById('balance').style.color =
            balance >= 0 ? '#2ecc71' : '#e74c3c';

        renderRecentTransactions(transactions.slice(0, 5));
        renderCharts(transactions);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderRecentTransactions(transactions) {
    const tbody = document.getElementById('recent-transactions-body');

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No transactions yet</td></tr>`;
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
        </tr>
    `).join('');
}

/**
 * Groups transactions by category name and splits them into income vs expense
 * buckets. Each bucket stores the running total and the category color for
 * use in the doughnut charts.
 *
 * @param {object[]} transactions - Transactions with `category_type`, `category_name`, `amount`, `color`
 */
function renderCharts(transactions) {
    const incomeData = {};
    const expenseData = {};

    transactions.forEach(transaction => {
        if (transaction.category_type === 'income') {
            if (!incomeData[transaction.category_name]) {
                incomeData[transaction.category_name] = {
                    amount: 0,
                    color: transaction.color
                };
            }
            incomeData[transaction.category_name].amount += transaction.amount;
        } else {
            if (!expenseData[transaction.category_name]) {
                expenseData[transaction.category_name] = {
                    amount: 0,
                    color: transaction.color
                };
            }
            expenseData[transaction.category_name].amount += transaction.amount;
        }
    });

    createChart('income-chart', 'Income by Category', incomeData);
    createChart('expense-chart', 'Expenses by Category', expenseData);
}

/**
 * Renders a doughnut chart for a category breakdown.
 *
 * @param {string} canvasId - ID of the `<canvas>` element
 * @param {string} label - Dataset label shown in Chart.js
 * @param {Record<string, { amount: number, color: string }>} data
 *   Map of category name → total amount and slice color
 */
function createChart(canvasId, label, data) {
    const canvas = document.getElementById(canvasId);

    if (Object.keys(data).length === 0) {
        canvas.parentElement.innerHTML += '<p>No data yet</p>';
        return;
    }

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label,
                data: Object.values(data).map(d => d.amount),
                backgroundColor: Object.values(data).map(d => d.color),
                borderWidth: 2,
                borderColor: '#1a1a1a'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#df00ff',
                        padding: 15,
                        font: {
                            family: 'Montserrat',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `€${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

loadDashboard();
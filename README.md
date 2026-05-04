# BudgetTracker 💰
 
A full-stack budget tracking web application for managing personal finances. Track your income, expenses, and spending habits through an intuitive dashboard with visual charts.
 
## 🔗 Live Demo
**[https://budgettracker-woxx.onrender.com](https://budgettracker-woxx.onrender.com)**
 
---
 
## 📸 Preview
 
![BudgetTracker Dashboard](./preview.png)
 
---
 
## ✨ Features
 
- **Dashboard** — Real-time overview of balance, total income, and total expenses
- **Visual Charts** — Donut charts showing income and expenses broken down by category
- **Transactions** — Full list of transactions with filtering support and ability to create new ones
- **Categories** — Manage custom categories (income or expense type) with color coding
- **REST API** — Clean backend API with structured endpoints for all data operations
- **Auto-seeded Database** — Default categories created automatically on first run
---
 
## 🛠️ Tech Stack
 
**Frontend**
- HTML, CSS, JavaScript (Vanilla)
- Chart.js for data visualization

**Backend**
- Node.js
- Express.js
- SQLite (via better-sqlite3)

**Architecture**
- RESTful API design
- Raw SQL queries (no ORM)
- Separation of frontend and backend
---
 
## 🚀 Running Locally
 
**1. Clone the repository**
```bash
git clone https://github.com/debil-ultra/BudgetTracker.git
cd BudgetTracker
```
 
**2. Install dependencies**
```bash
cd backend
npm install
```
 
**3. Start the server**
```bash
node app.js
```
 
**4. Open in browser**
```
http://localhost:3000
```
 
---
 
## 📡 API Endpoints
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create a new category |
| PUT | `/categories/:id` | Update a category |
| DELETE | `/categories/:id` | Delete a category |
| GET | `/transactions` | Get all transactions |
| POST | `/transactions` | Create a new transaction |
| PUT | `/transactions/:id` | Update a transaction |
| DELETE | `/transactions/:id` | Delete a transaction |
 
---
 
## 📁 Project Structure
 
```
BudgetTracker/
├── backend/
│   ├── app.js          # Express server & middleware
│   ├── database.js     # SQLite connection & schema
│   └── routes/
│       ├── categories.js
│       └── transactions.js
└── frontend/
    ├── index.html
    ├── api.js          # Centralized API calls
    └── ...
```
 
---
 
## 💡 What I Learned
 
This project was built as a class project and extended as a portfolio piece. The core learning was:
- Designing and building a REST API from scratch
- Writing raw SQL queries without an ORM
- Connecting a database to a live backend
- Deploying a full-stack Node.js app to production
---
 
## ⚠️ Notes
 
- Uses SQLite for simplicity — in a production environment this would be replaced with PostgreSQL
- Data persists on the server but may reset on Render's free tier after inactivity

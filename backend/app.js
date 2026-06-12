/**
 * Express application entry point.
 *
 * Boots the server, initializes the SQLite database (via side-effect import),
 * mounts the REST API routes, and serves the frontend as static files from
 * the sibling `frontend/` folder. In production (e.g. Render) the same
 * process handles both the API and the HTML/JS/CSS assets.
 *
 * @module app
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import './database/seed.js';
import categoriesRouter from './routers/categories.js';
import transactionsRouter from './routers/transactions.js';
import budgetsRouter from './routers/budgets.js';
import { notFoundHandler, globalErrorHandler } from './helpers/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Allow the frontend (local or deployed) to call the API from another origin.
app.use(cors());
app.use(express.json());

// Serve HTML, CSS, and JS from ../frontend (api.js, charts, etc.).
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/categories', categoriesRouter);
app.use('/transactions', transactionsRouter);
app.use('/budgets', budgetsRouter);

// Fallback: directly visits to the dashboard page.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Unknown routes receive a JSON 404 instead of falling through silently.
app.use(notFoundHandler);

// Catches malformed JSON, database errors, and any unexpected exceptions.
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
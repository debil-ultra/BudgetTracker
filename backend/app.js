import express from 'express';
import cors from 'cors';
import './database.js';
import categoriesRouter from './routes/categories.js';
import transactionsRouter from './routes/transactions.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/categories',categoriesRouter);
app.use('/transactions',transactionsRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});
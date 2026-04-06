import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Thrift-Link API is running' });
});

// Fetch inventory
app.get('/api/inventory', async (req, res) => {
  try {
    // Note: To successfully query, you must create a database named 'thrift_db'
    // and a table named 'inventory' in your MySQL instance.
    const [rows] = await pool.query('SELECT * FROM inventory ORDER BY id DESC');
    res.json(rows);
  } catch (error: any) {
    console.error('Database connection failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const item_id = '#TL-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const rental_price = (parseFloat(price) * 0.3).toFixed(2);
    const query = `INSERT INTO inventory (item_id, name, category, price, rental_price, status, unique_piece) VALUES (?, ?, ?, ?, ?, 'Available', true)`;
    await pool.query(query, [item_id, name, category, price, rental_price]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE inventory SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend Server running at http://localhost:${port}`);
  console.log('Remember to configure your MySQL connection in server/.env');
});

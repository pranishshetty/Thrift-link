import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function setup() {
  const password = process.env.DB_PASSWORD || ''; // Many local setups have no password or 'password'
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: password
  });

  console.log('Connected to MySQL. Creating database and table...');

  await connection.query('CREATE DATABASE IF NOT EXISTS thrift_db');
  await connection.query('USE thrift_db');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      price DECIMAL(10, 2) NOT NULL,
      rental_price DECIMAL(10, 2),
      status VARCHAR(50) DEFAULT 'Available',
      unique_piece BOOLEAN DEFAULT true
    )
  `;
  await connection.query(createTableQuery);

  const [rows]: any = await connection.query('SELECT COUNT(*) as count FROM inventory');
  if (rows[0].count === 0) {
    console.log('Seeding initial data...');
    const seedQuery = `
      INSERT INTO inventory (item_id, name, category, price, rental_price, status, unique_piece) VALUES
      ('#TL-092', 'Classic Corduroy Jacket', 'Vintage', 85.00, 25.00, 'Available', true),
      ('#TL-093', 'Floral Summer Dress', 'Boho Chic', 60.00, 18.00, 'Reserved', true),
      ('#TL-094', 'Timeless Leather Bag', 'Accessories', 120.00, 35.00, 'Sold', true)
    `;
    await connection.query(seedQuery);
  }

  console.log('Database setup complete!');
  await connection.end();
}

setup().catch(err => {
  console.error('\n--- DB SETUP ERROR ---');
  console.error('Failed to setup DB:', err.message);
  console.error('You may need to update your MySQL root password in server/.env or server/setupDb.ts');
  process.exit(1);
});

const { Pool } = require('pg');

// PostgreSQL database connection setup
const pool = new Pool({
  user: 'burhan',                       // Aapka username
  host: 'localhost',
  database: 'postgresql',               // Database ka naam 'postgresql' set kar diya hai
  password: '12345678',                 // Aapka password
  port: 5432,                           // PostgreSQL default port
});

// Test karne ke liye ke connection sahi bana hai ya nahi
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Database connection error:', err.stack);
  }
  console.log('PostgreSQL Connected Successfully!');
  release();
});

module.exports = pool;
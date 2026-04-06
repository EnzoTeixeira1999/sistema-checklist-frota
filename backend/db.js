const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'frota',
  password: '011199',
  port: 5432,
});

module.exports = pool;
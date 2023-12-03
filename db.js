const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'arshniv.cuceurst1z3t.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'aA123456',
  database: 'arshniv'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.message);
  } else {
    console.log('Connected to the database');
  }
});

module.exports = db;

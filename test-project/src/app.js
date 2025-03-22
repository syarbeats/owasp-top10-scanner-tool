/**
 * Sample application with OWASP Top Ten vulnerabilities
 */

const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password123',  // A05:2021 - Security Misconfiguration (hardcoded credentials)
  database: 'myapp'
});

db.connect();

// A03:2021 - Injection (SQL Injection)
app.get('/users', (req, res) => {
  const userId = req.query.id;
  const query = `SELECT * FROM users WHERE id = ${userId}`; // SQL Injection vulnerability
  
  db.query(query, (err, results) => {
    if (err) {
      console.error(err); // A09:2021 - Logging Failures (logging error details)
      return res.status(500).json({ error: err.message }); // Exposing error details
    }
    res.json(results);
  });
});

// A01:2021 - Broken Access Control
app.get('/admin/users', (req, res) => {
  // Missing access control check
  const query = 'SELECT * FROM users';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// A02:2021 - Cryptographic Failures
function hashPassword(password) {
  // Using weak hashing algorithm
  return crypto.createHash('md5').update(password).digest('hex');
}

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  // A07:2021 - Authentication Failures (weak password validation)
  if (password.length > 3) {
    const hashedPassword = hashPassword(password);
    
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Registration failed' });
      }
      res.json({ success: true, userId: result.insertId });
    });
  } else {
    res.status(400).json({ error: 'Password too short' });
  }
});

// A10:2021 - Server-Side Request Forgery (SSRF)
app.get('/fetch-url', (req, res) => {
  const url = req.query.url;
  
  // SSRF vulnerability
  axios.get(url)
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch URL' });
    });
});

// A08:2021 - Software and Data Integrity Failures
app.get('/config', (req, res) => {
  const configFile = req.query.file || 'config.json';
  
  // Path traversal and unsafe deserialization
  fs.readFile(configFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read config' });
    }
    
    const config = JSON.parse(data); // Unsafe deserialization
    res.json(config);
  });
});

// A04:2021 - Insecure Design
app.post('/reset-password', (req, res) => {
  const { username } = req.body;
  
  // Missing rate limiting, allowing brute force attacks
  const query = 'SELECT email FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Send password reset email (not implemented)
    res.json({ success: true, message: 'Password reset email sent' });
  });
});

// A06:2021 - Vulnerable and Outdated Components
// Using outdated libraries (implied in package.json)

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;

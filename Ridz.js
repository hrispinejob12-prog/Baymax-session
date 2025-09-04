// Ridz.js
const express = require('express');
const path = require('path');
const app = express();
const __path = process.cwd();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let server = require('./qr'),
    code = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

// Ensure sessions directory exists
const fs = require('fs');
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Static Route to Serve Session Files ---
app.use('/sessions', express.static(sessionsDir));

// --- API Routes ---
app.use('/qr', server);
app.use('/code', code);

// --- HTML Page Routes ---
app.use('/pair', async (req, res, next) => {
  res.sendFile(path.join(__path, 'pair.html'));
});

app.use('/', async (req, res, next) => {
  res.sendFile(path.join(__path, 'main.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Server start
app.listen(PORT, () => {
  console.log(`
Don't Forget To Give Star ⭐

Server running on http://localhost:${PORT}`);
});

module.exports = app;

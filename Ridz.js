// Ridz.js
const express = require('express');
const path = require('path'); // Make sure path module is imported
const app = express();
__path = process.cwd();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let server = require('./qr'),
    code = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

// --- Static Route to Serve Session Files ---
// This makes the files in your 'sessions' directory available to be fetched by your bot.
app.use('/sessions', express.static(path.join(__dirname, 'sessions')));

// --- API Routes ---
app.use('/qr', server);
app.use('/code', code);

// --- HTML Page Routes ---
app.use('/pair', async (req, res, next) => {
    res.sendFile(__path + '/pair.html');
});

app.use('/', async (req, res, next) => {
    res.sendFile(__path + '/main.html');
});

// --- Middleware & Server Start ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(PORT, () => {
    console.log(`
Don't Forget To Give Star ⭐

Server running on http://localhost:${PORT}`);
});

module.exports = app;

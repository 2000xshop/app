const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs-extra');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const storeRoutes = require('./routes/storeRoutes');
const { ensureDataFiles } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3000;

ensureDataFiles();
fs.ensureDirSync(path.join(__dirname, 'public/uploads'));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-secret-accounting-app',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/store', storeRoutes);

const sendPage = (page) => (req, res) => res.sendFile(path.join(__dirname, 'public', page));

app.get('/', sendPage('index.html'));
app.get('/login', sendPage('login.html'));
app.get('/register', sendPage('register.html'));
app.get('/dashboard', sendPage('dashboard.html'));
app.get('/profile', sendPage('profile.html'));
app.get('/reports', sendPage('reports.html'));

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

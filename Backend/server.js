// server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const db = require('./db');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true if using HTTPS
      sameSite: 'lax'
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
const articleRoutes = require('./routes/article');
const commentRoutes = require('./routes/comment');
const authRoutes = require('./routes/auth');
const sitemapRoutes = require('./routes/sitemap');

app.use('/api/article', articleRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/auth', authRoutes);
app.use('/', sitemapRoutes)

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

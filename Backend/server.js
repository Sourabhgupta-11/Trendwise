const express    = require('express');
const cors       = require('cors');
const session    = require('express-session');
const MongoStore = require('connect-mongo');
const passport   = require('passport');
require('dotenv').config();
const db = require('./db');
require('./botScheduler.js');

const app = express();
app.set('trust proxy', 1);

app.use(cors({ origin: 'https://trendwise-swart.vercel.app', credentials: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL, collectionName: 'sessions' }),
  cookie: { httpOnly: true, secure: true, sameSite: 'none' }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/article',  require('./routes/article'));
app.use('/api/comment',  require('./routes/comment'));
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/',             require('./routes/sitemap'));

// ── Keep-alive ping (cron-job 1 hits this 2 min before bot)
app.get('/api/ping', (_req, res) => res.json({ status: 'awake', time: new Date() }));

// ── Bot trigger — responds immediately, runs in background
app.get('/api/trigger-bot', async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET)
    return res.status(401).json({ error: 'Unauthorized' });

  res.status(202).json({ success: true, message: 'Bot started' });

  try {
    await require('./bot/contentBot')();
    console.log('✅ Triggered bot run complete');
  } catch (err) {
    console.error('❌ Triggered bot error:', err.message);
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
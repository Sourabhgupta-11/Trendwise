const express = require('express');
const router  = express.Router();
const Article = require('./../models/Article');
const User    = require('./../models/User');

const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
};

// GET all articles — lean projection (NO content field, saves bandwidth)
router.get('/', async (req, res) => {
  try {
    const articles = await Article
      .find({}, 'title slug meta media category readTime createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.set('Cache-Control', 'public, max-age=600');
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single article by slug — full content only here
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).lean();
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.set('Cache-Control', 'public, max-age=600');
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new article
router.post('/', async (req, res) => {
  try {
    const { title, meta, content, media, category } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const wordCount = content ? content.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    const newArticle = new Article({ title, slug, meta, content, media, category, readTime });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Bookmarks (stored on User document) ──

// GET current user's bookmarked article IDs
router.get('/bookmarks/mine', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, 'bookmarks').lean();
    res.json(user?.bookmarks || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST toggle bookmark for an article
router.post('/:articleId/bookmark', ensureAuth, async (req, res) => {
  try {
    const { articleId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const idx = user.bookmarks.findIndex(id => id.toString() === articleId);
    let bookmarked;
    if (idx >= 0) {
      user.bookmarks.splice(idx, 1);
      bookmarked = false;
    } else {
      user.bookmarks.push(articleId);
      bookmarked = true;
    }
    await user.save();
    res.json({ bookmarked, bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
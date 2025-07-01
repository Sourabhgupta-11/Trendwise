const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

router.get('/articles', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/articles', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { title, content, slug, meta, media } = req.body;
    const article = new Article({ title, content, slug, meta, media });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    console.error('Error creating article:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/articles/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Article not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating article:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/articles/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/generate', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try { 
    res.json({ message: 'Content bot triggered (placeholder)' });
  } catch (err) {
    console.error('Error triggering content bot:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

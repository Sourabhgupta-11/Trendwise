// trendwise/backend/routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const Article = require('./../models/Article');

// GET all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new article
router.post('/', async (req, res) => {
  try {
    const { title, meta, content, media } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newArticle = new Article({ title, slug, meta, content, media });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const Article = require('./../models/Article');

// GET all articles — lean projection (NO content field, saves huge bandwidth)
router.get('/', async (req, res) => {
  try {
    const articles = await Article
      .find({}, 'title slug meta media category readTime createdAt')
      .sort({ createdAt: -1 })
      .lean();                    // plain JS objects, faster serialisation

    // Cache for 10 minutes — articles only change once a day
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

module.exports = router;
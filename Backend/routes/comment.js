const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const User = require('../models/User');

// GET comments for an article
router.get('/:articleId', async (req, res) => {
  try {
    const comments = await Comment.find({ articleId: req.params.articleId }).populate('userId', 'name avatar');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST a new comment
router.post('/',async (req, res) => {
  try {
    const { articleId,text } = req.body;
    const newComment = new Comment({ articleId, userId: req.user.id, text });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
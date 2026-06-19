const express = require('express');
const router  = express.Router();
const Comment = require('../models/Comment');

const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
};

// GET comments for an article — include like count + whether current user liked it
router.get('/:articleId', async (req, res) => {
  try {
    const comments = await Comment
      .find({ articleId: req.params.articleId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: 1 })
      .lean();

    const currentUserId = req.user?.id || req.user?._id?.toString();

    const shaped = comments.map(c => ({
      _id: c._id,
      articleId: c.articleId,
      userId: c.userId,
      text: c.text,
      createdAt: c.createdAt,
      likeCount: c.likes?.length || 0,
      likedByMe: currentUserId ? c.likes?.some(id => id.toString() === currentUserId) : false,
    }));

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST a new comment
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { articleId, text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text required' });

    const newComment = new Comment({ articleId, userId: req.user.id, text: text.trim() });
    await newComment.save();
    await newComment.populate('userId', 'name avatar');

    res.status(201).json({
      _id: newComment._id,
      articleId: newComment.articleId,
      userId: newComment.userId,
      text: newComment.text,
      createdAt: newComment.createdAt,
      likeCount: 0,
      likedByMe: false,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST toggle like on a comment — no duplicate user IDs
router.post('/:commentId/like', ensureAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const userId = req.user.id;
    const alreadyLiked = comment.likes.some(id => id.toString() === userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }
    await comment.save();

    res.json({ likeCount: comment.likes.length, likedByMe: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
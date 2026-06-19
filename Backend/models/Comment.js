const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true },
  likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
  createdAt: { type: Date, default: Date.now },
});

commentSchema.index({ articleId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
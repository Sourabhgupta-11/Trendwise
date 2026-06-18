const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  slug:     { type: String, required: true, unique: true },
  meta:     { type: String },
  content:  { type: String },
  media:    [String],
  category: { type: String, default: 'General' },
  readTime: { type: Number, default: 3 },         
  createdAt:{ type: Date, default: Date.now },
});

articleSchema.index({ createdAt: -1 });
articleSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Article', articleSchema);
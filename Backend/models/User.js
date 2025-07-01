const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  avatar: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  }
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);

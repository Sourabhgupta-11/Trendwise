// trendwise/backend/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// ⬇️ Configure Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// ⬇️ Don't use sessions
passport.serializeUser(() => {});
passport.deserializeUser(() => {});

// 🔐 JWT Signer
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 🌐 Google OAuth Entry
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// ✅ Google OAuth Callback (returns JWT)
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = generateToken(req.user);

  // Option 1: Send JWT in response
  res.redirect(`http://localhost:3000/auth-success?token=${token}`); // Frontend can extract it

  // Option 2: res.json({ token }); ← use this if you want raw response
});

module.exports = router;

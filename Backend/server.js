const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const db=require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({ secret: 'trendwise', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const articleRoutes=require("./routes/article")
const commentRoutes=require("./routes/comment")
const userRoutes=require("./routes/auth")

app.use('/api/article', articleRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/auth', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
});

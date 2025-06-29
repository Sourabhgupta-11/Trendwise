const mongoose=require('mongoose');
require('dotenv').config();
const mongoURL=process.env.MONGODB_LOCAL_URL

mongoose.connect(mongoURL)

const db = mongoose.connection;

db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

db.on('error', (err) => {
  console.log('Error opening MongoDB connection:', err);
});


module.exports=db;
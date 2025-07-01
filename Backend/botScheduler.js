const cron = require('node-cron');
const contentBot = require('./bot/contentBot'); 


cron.schedule('0 0 * * *', async () => {
  console.log('🤖 Running ContentBot - Scheduled Daily');
  try {
    await contentBot(); 
    console.log('✅ ContentBot completed successfully');
  } catch (err) {
    console.error('❌ ContentBot failed:', err.message);
  }
});

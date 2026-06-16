require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const googleTrends = require('google-trends-api');
const Article = require('../models/Article');
const db = require('../db');
const axios = require('axios');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Keyword-based category assignment
const assignCategory = (title) => {
  const t = title.toLowerCase();
  if (/tech|ai|software|cyber|app|digital|startup|space|robot|iphone|android|google|microsoft|meta|openai/.test(t)) return 'Tech';
  if (/cricket|ipl|football|sport|match|tournament|olympic|fifa|player|team|league|series|wicket|goal/.test(t)) return 'Sports';
  if (/election|modi|government|parliament|minister|policy|party|vote|political|bjp|congress|rahul|amit/.test(t)) return 'Politics';
  if (/film|movie|bollywood|actor|actress|music|celeb|ott|netflix|series|award|trailer|song|celebrity/.test(t)) return 'Entertainment';
  if (/market|economy|gdp|stock|rupee|trade|budget|business|company|inflation|sensex|nifty|rbi|startup|ipo/.test(t)) return 'Business';
  if (/school|college|university|exam|upsc|jee|neet|student|education|result|admission|cbse|board|scholarship/.test(t)) return 'Education';
  return 'General';
};

// Fetch REAL trending topics from Google Trends for India
const fetchTrendingTopics = async () => {
  try {
    const results = await googleTrends.dailyTrends({ geo: 'IN' });
    const parsed = JSON.parse(results);
    const trendingStories = parsed?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

    // Extract top 12 trending topics with their titles
    const topics = trendingStories.slice(0, 12).map(story => ({
      title: story.title?.query || story.title,
      traffic: story.formattedTraffic || 'N/A',
    }));

    console.log(`✅ Fetched ${topics.length} real trending topics from Google Trends`);
    return topics;
  } catch (err) {
    console.error('❌ Google Trends failed, falling back to Gemini topics:', err.message);

    // Fallback: ask Gemini for trending topics if Google Trends fails
    try {
      const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `List exactly 10 highly trending news topics in India as of ${today}. 
Cover a mix of: politics, cricket/sports, technology, entertainment, business, education.
Only list topic titles. No numbering, no explanation. One per line.`,
      });
      const lines = response.text.split('\n').map(l => l.trim()).filter(Boolean);
      return lines.slice(0, 10).map(title => ({ title, traffic: 'N/A' }));
    } catch (fallbackErr) {
      console.error('❌ Gemini fallback also failed:', fallbackErr.message);
      return [];
    }
  }
};

const fetchRelatedMedia = async (topic) => {
  try {
    const [imageRes, youtubeRes] = await Promise.all([
      axios.get('https://api.unsplash.com/search/photos', {
        params: { query: topic, per_page: 1 },
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
      }),
      axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: topic,
          type: 'video',
          maxResults: 1,
          key: process.env.YOUTUBE_API_KEY,
          regionCode: 'IN',
          relevanceLanguage: 'en',
        },
      }),
    ]);

    const imageUrl = imageRes.data.results[0]?.urls?.regular || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600';
    const videoId = youtubeRes.data.items?.[0]?.id?.videoId;
    const videoUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

    return [imageUrl, videoUrl].filter(Boolean);
  } catch (error) {
    console.error('❌ Media fetch error:', error.message);
    return ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'];
  }
};

const generateArticle = async (topic, media) => {
  const prompt = `You're an expert Indian news blog writer.

Write a detailed, engaging blog article titled "${topic}" with these rules:
- First line must be: <meta description="one sentence summary here">
- Then write the article body starting with <h1>${topic}</h1>
- Use <h2> and <h3> subheadings to structure content
- Write at least 4 paragraphs of genuine insight about this topic
- Include relevant context about why this is trending in India
${media.length > 0 ? `- Reference this image naturally: ${media[0]}` : ''}
Do NOT include <html>, <head>, or <body> tags.
Do NOT wrap in markdown code blocks.
Return only plain HTML.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('❌ Gemini article generation error:', error.message);
    return null;
  }
};

const runContentBot = async () => {
  console.log('🤖 ContentBot starting...');

  // Delete articles older than 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const deleted = await Article.deleteMany({ createdAt: { $lt: sevenDaysAgo } });
  console.log(`🗑️ Deleted ${deleted.deletedCount} old articles`);

  const topics = await fetchTrendingTopics();
  if (topics.length === 0) {
    console.error('❌ No topics fetched. Aborting.');
    return;
  }

  let saved = 0;
  for (const trend of topics) {
    try {
      const title = trend.title;
      const slug = generateSlug(title);
      const category = assignCategory(title);

      // Skip duplicates
      const exists = await Article.findOne({ slug });
      if (exists) {
        console.log(`⏭️ Skipping duplicate: ${title}`);
        continue;
      }

      const media = await fetchRelatedMedia(title);
      const content = await generateArticle(title, media);
      if (!content) continue;

      const metaMatch = content.match(/<meta description="(.+?)"/i);
      const meta = metaMatch ? metaMatch[1] : title;

      const newArticle = new Article({ title, slug, meta, content, media, category });
      await newArticle.save();
      saved++;
      console.log(`✅ [${category}] Saved: ${title}`);
    } catch (err) {
      console.error(`❌ Error processing "${trend.title}":`, err.message);
    }
  }

  console.log(`🎉 ContentBot done. ${saved} new articles saved.`);
};

if (require.main === module) {
  runContentBot().then(() => process.exit(0));
}

module.exports = runContentBot;
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const googleTrends = require('google-trends-api');
const Article = require('../models/Article');
const db = require('../db');
const axios = require('axios');
const RSSParser = require('rss-parser');
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

const fetchTrendingTopics = async () => {
  // Google News RSS — works reliably on all cloud servers, no scraping
  const RSS_FEEDS = [
    'https://news.google.com/rss/headlines/section/geo/IN?hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pKVGlnQVAB?hl=en-IN&gl=IN&ceid=IN:en',
  ];

  try {
    const parser = new RSSParser();
    let allItems = [];

    for (const url of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(url);
        allItems = allItems.concat(feed.items || []);
      } catch (e) {
        console.log(`⚠️ RSS feed failed: ${url}`);
      }
    }

    if (allItems.length === 0) throw new Error('All RSS feeds failed');

    // Deduplicate by title, take top 12
    const seen = new Set();
    const topics = [];
    for (const item of allItems) {
      const title = item.title
        ?.replace(/\s*-\s*[^-]+$/, '')  // remove " - Source Name" suffix
        ?.trim();
      if (title && !seen.has(title) && title.length > 10) {
        seen.add(title);
        topics.push({ title, traffic: 'N/A' });
        if (topics.length >= 12) break;
      }
    }

    console.log(`✅ Fetched ${topics.length} topics from Google News RSS`);
    return topics;

  } catch (err) {
    console.error('❌ RSS fetch failed, falling back to Gemini topics:', err.message);

    // Gemini fallback with retry on 503
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest'];
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    for (const model of models) {
      try {
        console.log(`🔄 Trying Gemini model: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: `List exactly 10 highly trending news topics in India as of ${today}.
Cover a mix of: politics, cricket/sports, technology, entertainment, business, education.
Only list topic titles. No numbering, no explanation. One per line.`,
        });
        const lines = response.text.split('\n').map(l => l.trim()).filter(Boolean);
        console.log(`✅ Gemini fallback succeeded with ${model}`);
        return lines.slice(0, 10).map(title => ({ title, traffic: 'N/A' }));
      } catch (geminiErr) {
        console.error(`❌ ${model} failed:`, geminiErr.message);
      }
    }

    console.error('❌ All topic sources failed');
    return [];
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

  // Try models in order, with a delay on 503
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
      } catch (err) {
        const is503 = err.message?.includes('503') || err.message?.includes('UNAVAILABLE');
        const is404 = err.message?.includes('404') || err.message?.includes('not found');

        if (is404) {
          console.log(`⚠️ Model ${model} not available, trying next...`);
          break; // try next model immediately
        }
        if (is503 && attempt === 1) {
          console.log(`⏳ ${model} overloaded, waiting 15s before retry...`);
          await new Promise(r => setTimeout(r, 15000));
          continue; // retry same model
        }
        console.error(`❌ ${model} attempt ${attempt} failed:`, err.message);
        break; // try next model
      }
    }
  }

  console.error(`❌ All models failed for: ${topic}`);
  return null;
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
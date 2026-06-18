require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const RSSParser      = require('rss-parser');
const Article        = require('../models/Article');
const db             = require('../db');
const axios          = require('axios');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/* ─── helpers ─────────────────────────────────────────────── */

const generateSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const assignCategory = (title) => {
  const t = title.toLowerCase();
  if (/tech|ai|software|cyber|app|digital|startup|space|robot|iphone|android|google|microsoft|meta|openai|5g|chip/.test(t)) return 'Tech';
  if (/cricket|ipl|football|sport|match|tournament|olympic|fifa|player|team|league|wicket|goal|tennis|hockey/.test(t)) return 'Sports';
  if (/election|modi|government|parliament|minister|policy|party|vote|political|bjp|congress|rahul|amit|supreme court/.test(t)) return 'Politics';
  if (/film|movie|bollywood|actor|actress|music|celeb|ott|netflix|series|award|trailer|song|celebrity|box office/.test(t)) return 'Entertainment';
  if (/market|economy|gdp|stock|rupee|trade|budget|business|company|inflation|sensex|nifty|rbi|ipo|startup|revenue/.test(t)) return 'Business';
  if (/school|college|university|exam|upsc|jee|neet|student|education|result|admission|cbse|board|scholarship|ugc/.test(t)) return 'Education';
  return 'General';
};

// Strip source suffix " - Times of India" etc., dedupe, clean
const cleanTitle = (raw) =>
  raw?.replace(/\s*[-–|]\s*[^-–|]{3,40}$/, '').trim();

/* ─── fetch trending topics via RSS ─────────────────────────── */

const fetchTrendingTopics = async () => {
  const FEEDS = [
    'https://news.google.com/rss/headlines/section/geo/IN?hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pKVGlnQVAB?hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/topics/CAAqIggKIhxDQkFTRHdvSkwyMHZNR1ptZHpWbUVnSmxiakFCUAE?hl=en-IN&gl=IN&ceid=IN:en', // business
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNR3QwTlRFU0FtVnVHZ0pKVGlnQVAB?hl=en-IN&gl=IN&ceid=IN:en', // tech
  ];

  try {
    const parser = new RSSParser();
    const allItems = [];

    await Promise.all(FEEDS.map(async (url) => {
      try {
        const feed = await parser.parseURL(url);
        allItems.push(...(feed.items || []));
      } catch (e) {
        console.log(`⚠️  RSS feed failed: ${url}`);
      }
    }));

    if (!allItems.length) throw new Error('All RSS feeds empty');

    const seen = new Set();
    const topics = [];
    for (const item of allItems) {
      const title = cleanTitle(item.title);
      if (title && title.length > 12 && !seen.has(title.toLowerCase())) {
        seen.add(title.toLowerCase());
        topics.push({ title, traffic: 'N/A' });
        if (topics.length >= 12) break;
      }
    }

    console.log(`✅ Fetched ${topics.length} real topics from Google News RSS`);
    return topics;
  } catch (err) {
    console.error('❌ RSS failed, using Gemini fallback:', err.message);
    return geminiTopicFallback();
  }
};

const geminiTopicFallback = async () => {
  const models = ['gemini-2.0-flash', 'gemini-2.5-flash'];
  const today  = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: `List exactly 10 trending news topics in India today (${today}).
Mix: politics, sports, tech, entertainment, business, education.
One per line. No numbering.`,
      });
      const lines = res.text.split('\n').map(l => l.trim()).filter(Boolean);
      console.log(`✅ Gemini fallback OK (${model})`);
      return lines.slice(0, 10).map(t => ({ title: t, traffic: 'N/A' }));
    } catch (e) {
      console.error(`❌ ${model}:`, e.message);
    }
  }
  return [];
};

/* ─── fetch RELEVANT media (key fix for mismatches) ─────────── */

const fetchRelatedMedia = async (topic) => {
  // Build a focused keyword string — remove common stop words that confuse image search
  const kw = topic.replace(/\b(india|indian|new|big|latest|top|why|how|what|amid|after|over|as|the|and|for|with|in|on|at|of|to)\b/gi, ' ')
               .replace(/\s+/g, ' ').trim().slice(0, 80);

  try {
    const [imageRes, youtubeRes] = await Promise.all([
      axios.get('https://api.unsplash.com/search/photos', {
        params: { query: kw, per_page: 3, orientation: 'landscape', content_filter: 'high' },
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        timeout: 8000,
      }),
      axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet', q: `${topic} news India 2025`,
          type: 'video', maxResults: 3,
          key: process.env.YOUTUBE_API_KEY,
          regionCode: 'IN', relevanceLanguage: 'en',
          videoDuration: 'medium',           // 4–20 min — proper news segments
          order: 'relevance',
        },
        timeout: 8000,
      }),
    ]);

    // Pick the image with most downloads (most relevant)
    const images = imageRes.data.results || [];
    const best   = images.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    const imageUrl = best[0]?.urls?.regular
      || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600';

    // Pick YouTube video whose title most closely matches topic words
    const topicWords = topic.toLowerCase().split(/\s+/);
    const videos = youtubeRes.data.items || [];
    const scored = videos.map(v => {
      const vTitle = (v.snippet?.title || '').toLowerCase();
      const score  = topicWords.filter(w => w.length > 3 && vTitle.includes(w)).length;
      return { ...v, score };
    }).sort((a, b) => b.score - a.score);

    const videoId  = scored[0]?.id?.videoId;
    const videoUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

    return [imageUrl, videoUrl].filter(Boolean);
  } catch (err) {
    console.error('❌ Media fetch error:', err.message);
    return ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'];
  }
};

/* ─── generate article ───────────────────────────────────────── */

const generateArticle = async (topic, media) => {
  const prompt = `You're an expert Indian news journalist writing for an online publication.

Write a detailed, well-structured article titled: "${topic}"

Rules:
- First line MUST be exactly: <meta description="[one crisp sentence summary]">
- Then: <h1>${topic}</h1>
- Use <h2> and <h3> for subheadings
- At least 5 paragraphs with genuine analysis and Indian context
- Include recent background, why it matters to Indian readers
- Natural tone — not robotic, not listicle
- DO NOT include <html>, <head>, <body> tags
- DO NOT use markdown or code blocks
- Return only HTML`;

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];
  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await ai.models.generateContent({ model, contents: prompt });
        return res.text;
      } catch (err) {
        const busy = err.message?.includes('503') || err.message?.includes('UNAVAILABLE');
        const gone = err.message?.includes('404') || err.message?.includes('not found');
        if (gone) break;
        if (busy && attempt === 1) {
          console.log(`⏳ ${model} busy, retrying in 15s…`);
          await new Promise(r => setTimeout(r, 15000));
          continue;
        }
        console.error(`❌ ${model} attempt ${attempt}:`, err.message);
        break;
      }
    }
  }
  return null;
};

/* ─── main runner ────────────────────────────────────────────── */

const runContentBot = async () => {
  console.log('🤖 ContentBot starting…');

  const ago7  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { deletedCount } = await Article.deleteMany({ createdAt: { $lt: ago7 } });
  console.log(`🗑️  Deleted ${deletedCount} old articles`);

  const topics = await fetchTrendingTopics();
  if (!topics.length) { console.error('❌ No topics. Aborting.'); return; }

  let saved = 0;
  for (const trend of topics) {
    try {
      const title    = trend.title;
      const slug     = generateSlug(title);
      const category = assignCategory(title);

      if (await Article.findOne({ slug })) {
        console.log(`⏭️  Duplicate: ${title}`); continue;
      }

      const media   = await fetchRelatedMedia(title);
      const content = await generateArticle(title, media);
      if (!content) continue;

      const metaMatch = content.match(/<meta description="(.+?)"/i);
      const meta      = metaMatch ? metaMatch[1] : title;

      // Compute read time from word count
      const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
      const readTime  = Math.max(1, Math.ceil(wordCount / 200));

      await new Article({ title, slug, meta, content, media, category, readTime }).save();
      saved++;
      console.log(`✅ [${category}] ${title}`);
    } catch (err) {
      console.error(`❌ "${trend.title}":`, err.message);
    }
  }

  console.log(`🎉 Done — ${saved} new articles saved.`);
};

if (require.main === module) {
  runContentBot().then(() => process.exit(0));
}

module.exports = runContentBot;
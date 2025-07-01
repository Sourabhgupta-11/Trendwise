require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const googleTrends = require('google-trends-api');
const Article = require('../models/Article');
const db= require('../db');
const axios = require('axios');

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Generate slug from title
const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Here we fetch trending topics using google-trends-api
const fetchTrendingTopics = async () => {
const prompt = `
You are a bot designed to extract trending topics.

Return exactly 10 unique, highly trending news topics in India today based on current events and online discussions.

- Only list the titles.
- No numbering, no extra text.
- One topic per line.

Example format:
Topic 1
Topic 2
...
Topic 10
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    return lines.slice(0, 10).map(title => ({
      title,
      traffic: 'N/A'
    }));
  } catch (err) {
    console.error('❌ Gemini failed to fetch trending topics:', err.message);
    return [];
  }
};

const fetchRelatedMedia = async (topic) => {
  try {
    // 🔍 Fetch image from Unsplash
    const imageRes = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: topic,
        per_page: 1,
      },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    });

    const imageUrl =
      imageRes.data.results[0]?.urls?.regular || 'https://via.placeholder.com/600x400';

    // 🎥 Fetch related YouTube video
    const youtubeRes = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          q: topic,
          type: 'video',
          maxResults: 1,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    const videoId = youtubeRes.data.items?.[0]?.id?.videoId;
    const videoUrl = videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : `https://www.youtube.com/embed/dQw4w9WgXcQ`; 

    return [imageUrl, videoUrl];
  } catch (error) {
    console.error('❌ Media fetch error:', error.message);
    return [
      'https://via.placeholder.com/600x400',
      `https://www.youtube.com/embed/dQw4w9WgXcQ`,
    ];
  }
};

//Here we are Generating article using Gemini API
const generateArticle = async (topic, media) => {
const prompt = `
You're an expert blog writer.

Write a blog article titled "${topic}" with these rules:
- Include one line at top: <meta description="...">
- Then write the article body, starting with <h1>
- Use <h2> and <h3> headings
- Mention these media links:
${media.join('\n')}
Do NOT include full <html>, <head>, or <body> tags.
Do NOT wrap output in \`\`\` or markdown code block.
Return only plain HTML tags and content.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Gemini error generating article:', error.message);
    return null;
  }
};

//Main Bot Function to run contentBot
const runContentBot = async () => {
  const topics = await fetchTrendingTopics();

  for (const trend of topics) {
    try {
      const title = trend.title;
      const media = await fetchRelatedMedia(title);
      const content = await generateArticle(title, media);
      if (!content) continue;

      const metaMatch = content.match(/<meta description=\"(.+?)\"/i);
      const meta = metaMatch ? metaMatch[1] : title;
      const slug = generateSlug(title);

      const exists = await Article.findOne({ slug });
      if (exists) {
        console.log(`⏭️ Skipping duplicate article: ${title}`);
        continue;
      }

      const newArticle = new Article({
        title,
        slug,
        meta,
        content,
        media
      });

      await newArticle.save();
      console.log(`✅ Article saved: ${title}`);
    } catch (err) {
      console.error(`❌ Error processing "${trend.title}":`, err.message);
    }
  }
};

if (require.main === module) {
  runContentBot();
}

module.exports = runContentBot;

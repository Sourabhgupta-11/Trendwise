// trendwise/backend/bot/contentBot.js

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const googleTrends = require('google-trends-api');
const Article = require('../models/Article');
const db= require('../db');

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Utility: Generate slug from title
const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// ✅ Fetch trending topics using google-trends-api
const fetchTrendingTopics = async () => {
  const prompt = `
List the top 5 trending topics in the United States today based on news and online discussions.
Just return the titles only as plain list without numbering.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    return lines.slice(0, 5).map(title => ({
      title,
      traffic: 'N/A'
    }));
  } catch (err) {
    console.error('❌ Gemini failed to fetch trending topics:', err.message);
    return [];
  }
};

// Mock function to generate related media (can be improved later)
const fetchRelatedMedia = async (topic) => {
  return [
    `https://source.unsplash.com/featured/?${encodeURIComponent(topic)}`,
    `https://www.youtube.com/embed/dQw4w9WgXcQ`
  ];
};

// Generate article using Gemini API
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

// Main Bot Function
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

// Run if executed directly
if (require.main === module) {
  runContentBot();
}

module.exports = runContentBot;

const express = require("express");
const router = express.Router();
const Article = require("../models/Article");

router.get("/sitemap.xml", async (req, res) => {
  try {
    const articles = await Article.find();
    const hostname = "https://trendwise-swart.vercel.app"; 

    const urls = articles.map((article) => {
      return `
        <url>
          <loc>${hostname}/article/${article.slug}</loc>
          <lastmod>${new Date(article.createdAt).toISOString()}</lastmod>
        </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err.message);
    res.status(500).send("Server error generating sitemap");
  }
});

module.exports = router;

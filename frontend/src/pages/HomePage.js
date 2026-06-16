import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";

const HomePage = ({ user }) => {
  
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('All');
  const query = new URLSearchParams(useLocation().search).get("search");

  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  axios.defaults.withCredentials = true; 
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`/api/article`);
        let data = res.data;
        if (query) {
          data = data.filter((article) =>
            article.title.toLowerCase().includes(query.toLowerCase())
          );
        }
        setArticles(data);
      } catch (err) {
        console.error("Error fetching articles:", err.message);
      }
    };
    fetchArticles();
  }, [query]);

  const categories = ['All', 'Tech', 'Sports', 'Politics', 'Entertainment', 'Business'];

  const filtered = articles.filter(a => {
    if (filter === 'All') return true;
    return a.title.toLowerCase().includes(filter.toLowerCase());
  });
  return (
  <div style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%)', minHeight: '100vh' }}>
    {/* Hero */}
    <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
      <h1 style={{ fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.5px' }}>🧠 TrendWise</h1>
      <p style={{ opacity: 0.8, fontSize: '1.1rem', marginTop: '8px' }}>
        AI-curated trending news, refreshed daily
      </p>
      <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>
        {articles.length > 0 && `${articles.length} articles · Last updated ${new Date(articles[0]?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
      </p>
    </div>

    {/* Category Filter */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '24px 20px', flexWrap: 'wrap' }}>
      {categories.map(cat => (
        <button key={cat} onClick={() => setFilter(cat)}
          style={{
            padding: '8px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            background: filter === cat ? '#4f46e5' : '#fff',
            color: filter === cat ? '#fff' : '#374151',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.2s'
          }}>
          {cat}
        </button>
      ))}
    </div>

    {/* Article Grid */}
    <div className="container pb-5">
      <div className="row">
        {filtered.length === 0
          ? <p className="text-center text-muted mt-4">No articles found.</p>
          : filtered.map(article => (
            <div key={article._id} className="col-md-4 mb-4">
              <ArticleCard article={article} user={user} />
            </div>
          ))}
      </div>
    </div>
  </div>
);
};

export default HomePage;

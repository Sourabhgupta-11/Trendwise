import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";

const HomePage = ({ user }) => {
  
  const [articles, setArticles] = useState([]);
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

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-5 text-center">
        <h1 className="display-5 fw-bold mb-3">📰 TrendWise</h1>
        <p className="lead text-muted">
          Discover trending news and insightful articles – generated with AI.
        </p>
      </div>
      <div className="container pb-5">
        <div className="row">
          {articles.map((article) => (
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

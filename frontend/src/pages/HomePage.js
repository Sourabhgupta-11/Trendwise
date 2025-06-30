import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const query = new URLSearchParams(useLocation().search).get("search");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/article");
        let data = res.data;
        if (query) {
          data = data.filter((article) =>
            article.title.toLowerCase().includes(query.toLowerCase())
          );
        }
        setArticles(data);
      }
      catch (err) {
        console.error("Error fetching articles:", err.message);
      }
    };
    fetchArticles();
  }, [query]);

  return (
    <div className="container mt-4">
      <h2>Latest Articles</h2>
      <div className="row">
        {articles.map((article) => (                                  //Here our each article card structure
          <div className="col-md-4 mb-4">
            <div
              className="card h-100 border-0 shadow-sm article-card"
              style={{
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div
                className="position-relative"
                style={{ height: "220px", backgroundColor: "#f9f9f9" }}
              >
                <img
                  src={article.media[0]}
                  alt={article.title}
                  className="w-100 h-100"
                  style={{
                    objectFit: "cover",
                    borderTopLeftRadius: "0.5rem",
                    borderTopRightRadius: "0.5rem",
                  }}
                />
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-semibold">{article.title}</h5>
                <p className="card-text text-muted small">
                  {article.meta.length > 100
                    ? article.meta.slice(0, 100) + "..."
                    : article.meta}
                </p>
                <a
                  href={`/article/${article.slug}`}
                  className="btn btn-sm btn-outline-primary mt-auto rounded-pill"
                >
                  Read More →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/article/${slug}`);
        setArticle(res.data);

        document.title = res.data.title;
        const metaTag = document.querySelector("meta[name='description']");
        if (metaTag) {
          metaTag.setAttribute('content', res.data.meta);
        } else {
          const newMeta = document.createElement('meta');
          newMeta.name = 'description';
          newMeta.content = res.data.meta;
          document.head.appendChild(newMeta);
        }
      } catch (err) {
        console.error('Error fetching article:', err.message);
      }
    };

    fetchArticle();
  }, [slug]);

  if (!article) {
    return <div className="container mt-5">Loading...</div>;
  }

  return (
    <div className="container py-5">
      {article.media && article.media[0] && (
        <div className="mb-4 text-center">
          <img
            src={article.media[0]}
            alt={article.title}
            className="img-fluid rounded shadow"
            style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
          />
        </div>
      )}

      {/* Title & Meta */}
      <div className="text-center mb-4">
        <h1 className="fw-bold">{article.title}</h1>
        <p className="text-muted">{article.meta}</p>
        <hr className="w-25 mx-auto" />
      </div>

      {/* Article Content */}
      <div
        className="article-body px-2 px-md-4"
        style={{ lineHeight: '1.8', fontSize: '1.1rem' }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Video Embed */}
      {article.media && article.media[1] && (
        <div className="mt-5">
          <h5 className="mb-3">Watch Related Video</h5>
          <div className="ratio ratio-16x9 shadow rounded overflow-hidden">
            <iframe
              src={article.media[1]}
              title="Embedded video"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;

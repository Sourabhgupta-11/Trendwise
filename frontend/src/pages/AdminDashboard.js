import React, { useEffect, useState } from 'react';
import axios from 'axios';


const AdminDashboard = ({ user }) => {

  const [articles, setArticles] = useState([]);
  const [newArticle, setNewArticle] = useState({ title: '', slug: '', meta: '', content: '', media: [] });
  const [editingId, setEditingId] = useState(null);

  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  axios.defaults.withCredentials = true; 

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await axios.get('/api/admin/articles');
      setArticles(res.data);
    } catch (err) {
      alert('Error fetching articles');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await axios.delete(`/api/admin/articles/${id}`);
      fetchArticles();
    } catch (err) {
      alert('Error deleting article');
    }
  };

  const handleEdit = (article) => {
    setNewArticle(article);
    setEditingId(article._id);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await axios.put(`/api/admin/articles/${editingId}`, newArticle);
      } else {
        await axios.post('/api/admin/articles', newArticle);
      }
      setNewArticle({ title: '', slug: '', meta: '', content: '', media: [] });
      setEditingId(null);
      fetchArticles();
    } catch (err) {
      alert('Error saving article');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">🛠 Admin Dashboard</h2>

      <div className="card mb-4 p-3 shadow-sm">
        <h5>{editingId ? '✏️ Edit Article' : '➕ Create Article'}</h5>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Title"
          value={newArticle.title}
          onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Slug"
          value={newArticle.slug}
          onChange={(e) => setNewArticle({ ...newArticle, slug: e.target.value })}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Meta Description"
          value={newArticle.meta}
          onChange={(e) => setNewArticle({ ...newArticle, meta: e.target.value })}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Content"
          value={newArticle.content}
          onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Image URL"
          value={newArticle.media[0] || ''}
          onChange={(e) => setNewArticle({ ...newArticle, media: [e.target.value] })}
        />
        <button className="btn btn-success" onClick={handleSave}>
          {editingId ? 'Update' : 'Create'} Article
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article._id}>
                <td>{article.title}</td>
                <td>{article.slug}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleEdit(article)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(article._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

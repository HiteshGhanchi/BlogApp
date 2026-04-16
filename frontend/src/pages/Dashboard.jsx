import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './Dashboard.css';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/posts', 
        { title, content, excerpt },
        { withCredentials: true }
      );
      setTitle('');
      setContent('');
      setExcerpt('');
      setShowEditor(false);
      fetchPosts(); // Refresh list
    } catch (error) {
      alert('Error creating post: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/posts/${id}`, { withCredentials: true });
      fetchPosts();
    } catch (error) {
      alert('Error deleting post');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Editorial Control</h1>
        <Button variant="primary" onClick={() => setShowEditor(!showEditor)}>
          {showEditor ? 'Cancel' : 'New Journal Entry'}
        </Button>
      </header>

      {showEditor && (
        <Card className="editor-card">
          <form onSubmit={handleCreatePost} className="editor-form">
            <input 
              type="text" 
              placeholder="Post Title" 
              className="editor-input-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea 
              placeholder="Short excerpt..." 
              className="editor-input-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
            <div className="quill-wrapper">
              <ReactQuill theme="snow" value={content} onChange={setContent} />
            </div>
            <div className="editor-actions">
              <Button type="submit" variant="primary">Publish Entry</Button>
            </div>
          </form>
        </Card>
      )}

      <main className="posts-manager">
        <h2 className="manager-subtitle">Recent Entries</h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="admin-table-row">
                  <td>{new Date(post.created_at).toLocaleDateString()}</td>
                  <td className="admin-table-title">{post.title}</td>
                  <td>
                    <button 
                      className="admin-delete-btn"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && !loading && (
                <tr>
                  <td colSpan="3" className="empty-state">No entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

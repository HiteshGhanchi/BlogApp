import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchPosts();
  }, []);

  return (
    <div className="home-page">
      <header className="hero-section">
        <h1 className="hero-title">Reflections on <br/><span className="italic">Digital Craftsmanship</span></h1>
        <p className="hero-subtitle">A curated space for long-form thoughts on cloud architecture, design systems, and the intersection of code and aesthetics.</p>
      </header>

      <main className="posts-grid">
        {loading ? (
          <div className="loading-state">Cultivating content...</div>
        ) : (
          posts.map((post, index) => (
            <Link to={`/post/${post.id}`} key={post.id} className="post-link">
              <Card className={`post-card ${index % 3 === 0 ? 'featured' : ''}`}>
                <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                <h2 className="post-title">{post.title}</h2>
                <p className="post-excerpt">{post.excerpt || post.content.substring(0, 150) + '...'}</p>
                <span className="read-more">Read Entry</span>
              </Card>
            </Link>
          ))
        )}
      </main>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PullQuote from '../components/ui/PullQuote';
import './PostDetails.css';

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div className="loading-container">Gathering insights...</div>;
  if (!post) return <div className="error-container">The entry could not be found.</div>;

  return (
    <article className="post-details">
      <header className="post-header">
        <Link to="/" className="back-link">← Journal</Link>
        <div className="post-meta">
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          <span className="separator">•</span>
          <span>{post.author}</span>
        </div>
        <h1 className="post-detail-title">{post.title}</h1>
      </header>

      <div className="post-content">
        {/* We assume content might have some basic formatting if it was from a WYSIWYG, 
            but for now we just treat it as text or simple markdown-like segments */}
        {post.content.split('\n\n').map((para, i) => {
          if (para.startsWith('>')) {
            return <PullQuote key={i} quote={para.substring(1).trim()} author={post.author} />;
          }
          return <p key={i}>{para}</p>;
        })}
      </div>
    </article>
  );
};

export default PostDetails;

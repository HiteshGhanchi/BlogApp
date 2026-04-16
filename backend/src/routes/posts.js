const express = require('express');
const router = express.Router();
const db = require('../config/db');
const redisClient = require('../config/redis');
const authenticate = require('../middleware/auth');

const CACHE_TTL = 3600; // 1 hour

// GET all posts
router.get('/', async (req, res) => {
  try {
    // 1. Try to get from Redis
    let cachedPosts;
    try {
      cachedPosts = await redisClient.get('all_blog_posts');
    } catch (redisError) {
      console.error('Redis Error (GET all posts):', redisError);
      // Continue to DB if Redis fails
    }

    if (cachedPosts) {
      console.log('Cache Hit: all_blog_posts');
      return res.json(JSON.parse(cachedPosts));
    }

    // 2. Cache Miss: Get from DB
    console.log('Cache Miss: all_blog_posts');
    const result = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    const posts = result.rows;

    // 3. Save to Redis
    try {
      await redisClient.setEx('all_blog_posts', CACHE_TTL, JSON.stringify(posts));
    } catch (redisError) {
      console.error('Redis Set Error:', redisError);
    }

    res.json(posts);
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET single post
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `post_${id}`;

  try {
    // 1. Try to get from Redis
    let cachedPost;
    try {
      cachedPost = await redisClient.get(cacheKey);
    } catch (redisError) {
      console.error(`Redis Error (GET post ${id}):`, redisError);
    }

    if (cachedPost) {
      console.log(`Cache Hit: ${cacheKey}`);
      return res.json(JSON.parse(cachedPost));
    }

    // 2. Cache Miss: Get from DB
    console.log(`Cache Miss: ${cacheKey}`);
    const result = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = result.rows[0];

    // 3. Save to Redis
    try {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(post));
    } catch (redisError) {
      console.error(`Redis Set Error (${cacheKey}):`, redisError);
    }

    res.json(post);
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// CREATE a post (Protected)
router.post('/', authenticate, async (req, res) => {
  const { title, content, excerpt } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO posts (title, content, excerpt) VALUES ($1, $2, $3) RETURNING *',
      [title, content, excerpt]
    );

    // CACHE INVALIDATION
    try {
      await redisClient.del('all_blog_posts');
      console.log('Cache Invalidated: all_blog_posts');
    } catch (redisError) {
      console.error('Redis Invalidation Error:', redisError);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE a post (Protected)
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // CACHE INVALIDATION
    try {
      await redisClient.del('all_blog_posts');
      await redisClient.del(`post_${id}`);
      console.log(`Cache Invalidated: all_blog_posts and post_${id}`);
    } catch (redisError) {
      console.error('Redis Invalidation Error:', redisError);
    }

    res.json({ message: 'Post deleted successfully', id });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

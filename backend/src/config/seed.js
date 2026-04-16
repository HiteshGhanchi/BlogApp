const db = require('./db');
const bcrypt = require('bcrypt');

const seedData = [
  {
    title: "The Silent Architecture of Whitespace",
    content: "In modern editorial design, whitespace is not merely an absence of content; it is a vital structural element. It provides the breathing room necessary for complex ideas to settle. \n\n> Whitespace is like air: it is necessary for design to breathe.\n\nBy strictly adhering to the 'No-Line' rule, we force the eye to rely on spatial relationships rather than artificial boundaries. This creates a sense of openness and luxury that divider lines often disrupt.",
    excerpt: "Exploring the philosophy behind minimal grid structures and the emotional impact of active whitespace."
  },
  {
    title: "Graceful Degradation in Distributed Systems",
    content: "Building resilient systems requires planning for failure as a first-class citizen. When a cache layer like Redis becomes unavailable, the system should not collapse. Instead, it should transition to a direct database query model. \n\nThis 'Graceful Degradation' ensures that while performance might take a minor hit, the availability of the application remains intact for the end user.",
    excerpt: "How to design backends that survive container failures without compromising user experience."
  },
  {
    title: "The Deep Forest: A Study in Dark Mode Aesthetics",
    content: "Moving away from sterile #000000 blacks, the 'Deep Forest' theme uses organic greens and desaturated grays to create a more comfortable, high-end reading environment (#18301d). \n\nCombined with high-contrast surface containers, this approach provides depth and hierarchy without relying on traditional borders.",
    excerpt: "Synthesizing nature-inspired color palettes with modern digital interfaces."
  }
];

const seed = async () => {
  try {
    // Check if posts already exist
    const check = await db.query('SELECT COUNT(*) FROM posts');
    if (parseInt(check.rows[0].count) > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding database with initial journal entries...');
    for (const post of seedData) {
      await db.query(
        'INSERT INTO posts (title, content, excerpt) VALUES ($1, $2, $3)',
        [post.title, post.content, post.excerpt]
      );
    }
    
    // 2. Seed Admin User
    const userCheck = await db.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.log('Seeding default admin user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.query(
        'INSERT INTO users (username, password) VALUES ($1, $2)',
        ['admin', hashedPassword]
      );
      console.log('Admin user created: admin / password123');
    }

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

module.exports = seed;

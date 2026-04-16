import React from 'react';
import './PullQuote.css';

const PullQuote = ({ quote, author }) => {
  return (
    <blockquote className="pull-quote">
      <p className="pull-quote-text">{quote}</p>
      {author && <footer className="pull-quote-author">— {author}</footer>}
    </blockquote>
  );
};

export default PullQuote;

import React from 'react';
import './Card.css';

const Card = ({ children, padding = 'var(--spacing-xl)', className = '' }) => {
  return (
    <div 
      className={`card-container ${className}`}
      style={{ padding }}
    >
      {children}
    </div>
  );
};

export default Card;

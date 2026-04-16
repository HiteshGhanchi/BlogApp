import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', onClick, type = 'button', className = '' }) => {
  return (
    <button 
      type={type} 
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;

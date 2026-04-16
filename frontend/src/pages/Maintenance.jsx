import React from 'react';
import './Maintenance.css';

const Maintenance = () => {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <h1 className="maintenance-title">Intermission</h1>
        <p className="maintenance-subtitle">
          The journal is currently undergoing architectural refinement. <br/>
          We will return to our regular schedule shortly.
        </p>
        <div className="maintenance-visual">
          <div className="dot pulse"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <button 
          className="maintenance-btn" 
          onClick={() => window.location.reload()}
        >
          Check Restoration
        </button>
      </div>
    </div>
  );
};

export default Maintenance;

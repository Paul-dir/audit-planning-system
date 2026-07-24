import React from 'react';

function Card({ title, number, icon, children, style, className }) {
  // If children are provided, render children instead of title/number/icon
  if (children) {
    return (
      <div className={`card ${className || ''}`} style={style}>
        {children}
      </div>
    );
  }

  // Standard card format with title, number, and icon
  return (
    <div className="card">
      <div className="info">
        <h3>{title}</h3>
        <div className="number">{number}</div>
      </div>
      <div className="icon">
        <i className={icon}></i>
      </div>
    </div>
  );
}

export default Card;

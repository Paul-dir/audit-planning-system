import React from 'react';

function Badge({ status, className }) {
  return (
    <span className={`badge ${className || ''}`}>
      {status}
    </span>
  );
}

export default Badge;

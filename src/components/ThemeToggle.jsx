import React, { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false); // Light mode is default

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const stored = localStorage.getItem('theme');
    let dark = false;
    
    if (stored) {
      dark = stored === 'dark';
    } else {
      // Check system preference
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDark(dark);
    applyTheme(dark);
  }, []);

  const applyTheme = (dark) => {
    const html = document.documentElement;
    
    if (dark) {
      html.classList.remove('light');
      html.classList.add('dark');
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      localStorage.setItem('theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        width: '38px',
        height: '38px',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        fontSize: '14px',
        fontWeight: '500',
      }}
      onMouseEnter={(e) => {
        e.target.style.borderColor = 'var(--primary)';
        e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
        e.target.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.borderColor = 'var(--border)';
        e.target.style.boxShadow = 'none';
        e.target.style.transform = 'translateY(0)';
      }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <i className="fas fa-sun" style={{ fontSize: '14px' }}></i>
      ) : (
        <i className="fas fa-moon" style={{ fontSize: '14px' }}></i>
      )}
    </button>
  );
}

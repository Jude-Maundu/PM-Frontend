import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const [animKey, setAnimKey] = useState(0);

  const handleToggle = () => {
    setAnimKey(k => k + 1);
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className={`theme-pill ${isDark ? 'theme-pill--dark' : 'theme-pill--light'} ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      <span className="tp-track">
        {/* Stars visible in dark mode */}
        <span className="tp-stars">
          <span /><span /><span />
        </span>
        {/* Cloud streaks visible in light mode */}
        <span className="tp-clouds">
          <span /><span />
        </span>
        {/* Sliding thumb */}
        <span className="tp-thumb">
          <span key={animKey} className="tp-icon">
            {isDark
              ? <i className="fas fa-moon" style={{ color: '#c4b5fd' }}></i>
              : <i className="fas fa-sun"  style={{ color: '#FDB813' }}></i>
            }
          </span>
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;

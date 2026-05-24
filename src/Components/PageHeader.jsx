import React from "react";

const PageHeader = ({ subtitle, actions, searchQuery, onSearch, searchPlaceholder }) => {
  if (!onSearch && !subtitle && !actions) return null;
  return (
    <div className="mc-page-header">
      {onSearch && (
        <div className="mc-page-search-wrap">
          <i className="fas fa-search mc-search-icon"></i>
          <input
            className="mc-search"
            placeholder={searchPlaceholder || "Search..."}
            value={searchQuery || ""}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
      )}
      {subtitle && !onSearch && <p className="mc-page-sub">{subtitle}</p>}
      {actions && <div className="mc-page-actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;

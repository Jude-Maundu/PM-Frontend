import React from "react";
import ThemeToggle from "./ThemeToggle";

const PageHeader = ({ title, subtitle, actions, searchQuery, onSearch, searchPlaceholder }) => (
  <div className="mc-topbar">
    {onSearch ? (
      <div className="mc-search-wrap">
        <i className="fas fa-search mc-search-icon"></i>
        <input
          className="mc-search"
          placeholder={searchPlaceholder || "Search..."}
          value={searchQuery || ""}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
    ) : (
      <div>
        <h5 className="mc-page-title">{title}</h5>
        {subtitle && <p className="mc-page-sub">{subtitle}</p>}
      </div>
    )}
    <div className="mc-topbar-actions">
      {onSearch && (
        <div style={{ marginRight: "0.25rem" }}>
          <h5 className="mc-page-title" style={{ margin: 0 }}>{title}</h5>
        </div>
      )}
      {actions}
      <ThemeToggle />
    </div>
  </div>
);

export default PageHeader;

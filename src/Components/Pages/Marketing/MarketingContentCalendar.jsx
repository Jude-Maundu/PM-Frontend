import React from "react";
import MarketingLayout from "./MarketingLayout";
import StaffCrudManager from "../Shared/StaffCrudManager";

export default function MarketingContentCalendar() {
  return (
    <StaffCrudManager
      Layout={MarketingLayout}
      accent="#F59E0B"
      title="Content Calendar"
      subtitle="Create and manage marketing content schedule entries with real CRUD."
      group="marketing"
      resource="content-calendar"
      resourceLabel="Content Entry"
      fields={[
        { key: "title", label: "Title", colClass: "col-md-6" },
        { key: "channel", label: "Channel", colClass: "col-md-6", defaultValue: "homepage" },
        { key: "contentType", label: "Content Type", type: "select", colClass: "col-md-6", defaultValue: "banner", options: [
          { value: "banner", label: "Banner" }, { value: "email", label: "Email" }, { value: "social", label: "Social" }, { value: "blog", label: "Blog" }, { value: "push", label: "Push" },
        ] },
        { key: "status", label: "Status", type: "select", colClass: "col-md-6", defaultValue: "idea", options: [
          { value: "idea", label: "Idea" }, { value: "draft", label: "Draft" }, { value: "scheduled", label: "Scheduled" }, { value: "published", label: "Published" },
        ] },
        { key: "publishDate", label: "Publish Date", type: "date", colClass: "col-md-6" },
        { key: "assetUrl", label: "Asset URL", colClass: "col-md-6" },
        { key: "description", label: "Description", type: "textarea", colClass: "col-12" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "contentType", label: "Type" },
        { key: "status", label: "Status" },
        { key: "channel", label: "Channel" },
        { key: "publishDate", label: "Publish", render: (row) => row.publishDate ? new Date(row.publishDate).toLocaleDateString() : "—" },
      ]}
    />
  );
}

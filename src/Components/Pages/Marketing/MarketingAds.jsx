import React from "react";
import MarketingLayout from "./MarketingLayout";
import StaffCrudManager from "../Shared/StaffCrudManager";

export default function MarketingAds() {
  return (
    <StaffCrudManager
      Layout={MarketingLayout}
      accent="#F59E0B"
      title="Advertisements"
      subtitle="Manage ad inventory, performance values, and campaign creatives with CRUD."
      group="marketing"
      resource="ads"
      resourceLabel="Ad"
      fields={[
        { key: "name", label: "Name", colClass: "col-md-6" },
        { key: "platform", label: "Platform", colClass: "col-md-6", defaultValue: "meta" },
        { key: "status", label: "Status", type: "select", colClass: "col-md-6", defaultValue: "draft", options: [
          { value: "draft", label: "Draft" }, { value: "active", label: "Active" }, { value: "paused", label: "Paused" }, { value: "completed", label: "Completed" },
        ] },
        { key: "budget", label: "Budget", type: "number", colClass: "col-md-6", defaultValue: 0 },
        { key: "spend", label: "Spend", type: "number", colClass: "col-md-4", defaultValue: 0 },
        { key: "ctr", label: "CTR", type: "number", colClass: "col-md-4", defaultValue: 0 },
        { key: "cpc", label: "CPC", type: "number", colClass: "col-md-4", defaultValue: 0 },
        { key: "audience", label: "Audience", colClass: "col-12" },
        { key: "creativeNotes", label: "Creative Notes", type: "textarea", colClass: "col-12" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "platform", label: "Platform" },
        { key: "status", label: "Status" },
        { key: "budget", label: "Budget", render: (row) => `KES ${Number(row.budget || 0).toLocaleString()}` },
        { key: "spend", label: "Spend", render: (row) => `KES ${Number(row.spend || 0).toLocaleString()}` },
      ]}
    />
  );
}

import React from "react";
import MarketingLayout from "./MarketingLayout";
import StaffCrudManager from "../Shared/StaffCrudManager";

export default function MarketingCampaigns() {
  return (
    <StaffCrudManager
      Layout={MarketingLayout}
      accent="#F59E0B"
      title="Campaigns"
      subtitle="Create and manage marketing campaigns with full CRUD."
      group="marketing"
      resource="campaigns"
      resourceLabel="Campaign"
      fields={[
        { key: "name", label: "Name", colClass: "col-md-6" },
        { key: "channel", label: "Channel", colClass: "col-md-6", defaultValue: "multi-channel" },
        { key: "status", label: "Status", type: "select", colClass: "col-md-6", defaultValue: "draft", options: [
          { value: "draft", label: "Draft" }, { value: "scheduled", label: "Scheduled" }, { value: "active", label: "Active" }, { value: "completed", label: "Completed" }, { value: "paused", label: "Paused" },
        ] },
        { key: "budget", label: "Budget", type: "number", colClass: "col-md-6", defaultValue: 0 },
        { key: "startDate", label: "Start Date", type: "date", colClass: "col-md-6" },
        { key: "endDate", label: "End Date", type: "date", colClass: "col-md-6" },
        { key: "targetAudience", label: "Target Audience", colClass: "col-12" },
        { key: "description", label: "Description", type: "textarea", colClass: "col-12" },
        { key: "goals", label: "Goals", type: "textarea", colClass: "col-12" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "channel", label: "Channel" },
        { key: "status", label: "Status" },
        { key: "budget", label: "Budget", render: (row) => `KES ${Number(row.budget || 0).toLocaleString()}` },
        { key: "startDate", label: "Start", render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "—" },
      ]}
    />
  );
}

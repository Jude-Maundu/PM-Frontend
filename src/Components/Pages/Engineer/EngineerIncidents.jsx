import React from "react";
import EngineerLayout from "./EngineerLayout";
import StaffCrudManager from "../Shared/StaffCrudManager";

export default function EngineerIncidents() {
  return (
    <StaffCrudManager
      Layout={EngineerLayout}
      accent="#06B6D4"
      title="Incidents"
      subtitle="Track engineering incidents with real CRUD backed by the database."
      group="engineer"
      resource="incidents"
      resourceLabel="Incident"
      fields={[
        { key: "title", label: "Title", colClass: "col-md-6" },
        { key: "service", label: "Service", colClass: "col-md-6", defaultValue: "platform" },
        { key: "severity", label: "Severity", type: "select", colClass: "col-md-6", defaultValue: "medium", options: [
          { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "critical", label: "Critical" },
        ] },
        { key: "status", label: "Status", type: "select", colClass: "col-md-6", defaultValue: "open", options: [
          { value: "open", label: "Open" }, { value: "investigating", label: "Investigating" }, { value: "resolved", label: "Resolved" },
        ] },
        { key: "startedAt", label: "Started At", type: "date", colClass: "col-md-6" },
        { key: "resolvedAt", label: "Resolved At", type: "date", colClass: "col-md-6" },
        { key: "description", label: "Description", type: "textarea", colClass: "col-12" },
        { key: "rootCause", label: "Root Cause", type: "textarea", colClass: "col-12" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "service", label: "Service" },
        { key: "severity", label: "Severity" },
        { key: "status", label: "Status" },
        { key: "startedAt", label: "Started", render: (row) => row.startedAt ? new Date(row.startedAt).toLocaleDateString() : "—" },
      ]}
    />
  );
}

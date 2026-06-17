import React from "react";
import EngineerLayout from "./EngineerLayout";
import StaffCrudManager from "../Shared/StaffCrudManager";

export default function EngineerBackups() {
  return (
    <StaffCrudManager
      Layout={EngineerLayout}
      accent="#06B6D4"
      title="Backups"
      subtitle="Create and manage backup run records with real CRUD."
      group="engineer"
      resource="backups"
      resourceLabel="Backup"
      fields={[
        { key: "name", label: "Name", colClass: "col-md-6" },
        { key: "environment", label: "Environment", colClass: "col-md-6", defaultValue: "production" },
        { key: "backupType", label: "Backup Type", type: "select", colClass: "col-md-6", defaultValue: "database", options: [
          { value: "database", label: "Database" }, { value: "media", label: "Media" }, { value: "full", label: "Full" },
        ] },
        { key: "status", label: "Status", type: "select", colClass: "col-md-6", defaultValue: "scheduled", options: [
          { value: "scheduled", label: "Scheduled" }, { value: "running", label: "Running" }, { value: "completed", label: "Completed" }, { value: "failed", label: "Failed" },
        ] },
        { key: "storageProvider", label: "Storage Provider", colClass: "col-md-6", defaultValue: "local" },
        { key: "executedAt", label: "Executed At", type: "date", colClass: "col-md-6" },
        { key: "restorePoint", label: "Restore Point", colClass: "col-12" },
        { key: "notes", label: "Notes", type: "textarea", colClass: "col-12" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "environment", label: "Environment" },
        { key: "backupType", label: "Type" },
        { key: "status", label: "Status" },
        { key: "executedAt", label: "Executed", render: (row) => row.executedAt ? new Date(row.executedAt).toLocaleDateString() : "—" },
      ]}
    />
  );
}

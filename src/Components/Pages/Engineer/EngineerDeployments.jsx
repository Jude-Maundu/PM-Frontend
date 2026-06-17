import React from "react";
import EngineerLayout from "./EngineerLayout";
import StaffCrudManager from "../Shared/StaffCrudManager";

export default function EngineerDeployments() {
  return (
    <StaffCrudManager
      Layout={EngineerLayout}
      accent="#06B6D4"
      title="Deployments"
      subtitle="Track release deployments and rollback readiness with real CRUD."
      group="engineer"
      resource="deployments"
      resourceLabel="Deployment"
      fields={[
        { key: "title", label: "Title", colClass: "col-md-6" },
        { key: "version", label: "Version", colClass: "col-md-6" },
        { key: "environment", label: "Environment", colClass: "col-md-6", defaultValue: "production" },
        { key: "status", label: "Status", type: "select", colClass: "col-md-6", defaultValue: "scheduled", options: [
          { value: "scheduled", label: "Scheduled" }, { value: "running", label: "Running" }, { value: "successful", label: "Successful" }, { value: "failed", label: "Failed" }, { value: "rolled_back", label: "Rolled Back" },
        ] },
        { key: "deployedAt", label: "Deployed At", type: "date", colClass: "col-md-6" },
        { key: "rollbackAvailable", label: "Rollback Available", type: "checkbox", colClass: "col-md-6", defaultValue: true },
        { key: "releaseNotes", label: "Release Notes", type: "textarea", colClass: "col-12" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "version", label: "Version" },
        { key: "environment", label: "Env" },
        { key: "status", label: "Status" },
        { key: "deployedAt", label: "Deployed", render: (row) => row.deployedAt ? new Date(row.deployedAt).toLocaleDateString() : "—" },
      ]}
    />
  );
}

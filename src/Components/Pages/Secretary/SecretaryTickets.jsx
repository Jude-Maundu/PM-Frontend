import React from "react";
import SecretaryLayout from "./SecretaryLayout";
import StaffCrudManager from "../Shared/StaffCrudManager";

export default function SecretaryTickets() {
  return (
    <StaffCrudManager
      Layout={SecretaryLayout}
      accent="#8B5CF6"
      title="Support Tickets"
      subtitle="Create, update, close, and delete secretary support tickets."
      group="secretary"
      resource="tickets"
      resourceLabel="Ticket"
      fields={[
        { key: "title", label: "Title", colClass: "col-md-6" },
        { key: "requesterName", label: "Requester Name", colClass: "col-md-6" },
        { key: "requesterEmail", label: "Requester Email", type: "email", colClass: "col-md-6" },
        { key: "category", label: "Category", colClass: "col-md-6", defaultValue: "general" },
        { key: "status", label: "Status", type: "select", colClass: "col-md-6", defaultValue: "open", options: [
          { value: "open", label: "Open" }, { value: "pending", label: "Pending" }, { value: "closed", label: "Closed" }, { value: "escalated", label: "Escalated" },
        ] },
        { key: "priority", label: "Priority", type: "select", colClass: "col-md-6", defaultValue: "medium", options: [
          { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "critical", label: "Critical" },
        ] },
        { key: "dueDate", label: "Due Date", type: "date", colClass: "col-md-6" },
        { key: "description", label: "Description", type: "textarea", colClass: "col-12" },
        { key: "resolutionNotes", label: "Resolution Notes", type: "textarea", colClass: "col-12" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "requesterName", label: "Requester" },
        { key: "status", label: "Status" },
        { key: "priority", label: "Priority" },
        { key: "category", label: "Category" },
        { key: "dueDate", label: "Due", render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—" },
      ]}
    />
  );
}

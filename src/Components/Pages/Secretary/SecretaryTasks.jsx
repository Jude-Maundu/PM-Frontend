import React from "react";
import SecretaryLayout from "./SecretaryLayout";
import StaffCrudManager from "../Shared/StaffCrudManager";

export default function SecretaryTasks() {
  return (
    <StaffCrudManager
      Layout={SecretaryLayout}
      accent="#8B5CF6"
      title="Task Manager"
      subtitle="Create, update, complete, and delete secretary tasks."
      group="secretary"
      resource="tasks"
      resourceLabel="Task"
      fields={[
        { key: "title", label: "Title", colClass: "col-md-6" },
        { key: "taskType", label: "Task Type", colClass: "col-md-6", defaultValue: "operations" },
        { key: "status", label: "Status", type: "select", colClass: "col-md-6", defaultValue: "todo", options: [
          { value: "todo", label: "To Do" }, { value: "in_progress", label: "In Progress" }, { value: "done", label: "Done" }, { value: "blocked", label: "Blocked" },
        ] },
        { key: "priority", label: "Priority", type: "select", colClass: "col-md-6", defaultValue: "medium", options: [
          { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" },
        ] },
        { key: "dueDate", label: "Due Date", type: "date", colClass: "col-md-6" },
        { key: "description", label: "Description", type: "textarea", colClass: "col-12" },
        { key: "completionNotes", label: "Completion Notes", type: "textarea", colClass: "col-12" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "taskType", label: "Type" },
        { key: "status", label: "Status" },
        { key: "priority", label: "Priority" },
        { key: "dueDate", label: "Due", render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—" },
      ]}
    />
  );
}

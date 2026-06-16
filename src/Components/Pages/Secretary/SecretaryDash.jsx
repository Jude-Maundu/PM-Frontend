import React from "react";
import SecretaryLayout from "./SecretaryLayout";
import useStaffDashboard from "../../../hooks/useStaffDashboard";
import {
  ActivityList,
  DashboardHeader,
  DashboardSkeleton,
  EmptyState,
  KeyValueList,
  MetricGrid,
  MiniBars,
  Panel,
  TableLite,
} from "../Shared/StaffDashboardUI";

const accent = "#8B5CF6";

export default function SecretaryDash() {
  const { data, loading, error, refreshing, lastUpdated, refresh } = useStaffDashboard("secretary");

  if (loading && !data) {
    return (
      <SecretaryLayout>
        <DashboardSkeleton accent={accent} />
      </SecretaryLayout>
    );
  }

  const overview = data?.overview || {};
  const tickets = data?.tickets || {};
  const applications = data?.applications || {};
  const announcements = data?.announcements || {};
  const communications = data?.communications || {};
  const tasks = data?.tasks || {};
  const analytics = data?.analytics || {};
  const profile = data?.profile || {};

  return (
    <SecretaryLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <DashboardHeader
          title="Secretary Operations Center"
          subtitle="Live operational visibility for tickets, applications, communications, records, and internal workload."
          accent={accent}
          lastUpdated={lastUpdated}
          refreshing={refreshing}
          onRefresh={refresh}
        />

        {error ? (
          <div className="mc-card" style={{ border: "1px solid rgba(240,107,141,0.35)", color: "#F06B8D" }}>
            <i className="fas fa-triangle-exclamation me-2"></i>
            {error}
          </div>
        ) : null}

        <MetricGrid
          items={[
            { label: "Total Tickets", value: overview.totalTickets || 0, note: "Conversation-based support queue", icon: "fa-headset", color: accent },
            { label: "Pending Apps", value: overview.pendingApplications || 0, note: "Photographer reviews awaiting action", icon: "fa-user-clock", color: "#F06B8D" },
            { label: "Unread Announcements", value: overview.unreadAnnouncements || 0, note: "Admin/system notices", icon: "fa-bullhorn", color: "#5B7FE5" },
            { label: "Operations Backlog", value: overview.operationsBacklog || 0, note: "Pending work from live records", icon: "fa-list-check", color: "#4CC9A6" },
          ]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "1rem" }}>
          <Panel title="Recent Ticket Activity" badge={`${tickets.open || 0} open`} badgeColor={accent}>
            <ActivityList
              items={(tickets.recentActivity || []).map((item) => ({
                ...item,
                title: (item.action || "activity").replace(/_/g, " "),
                message: `${item.actor || "Staff"} • ${item.entityType || "Operational event"}`,
              }))}
              empty={<EmptyState icon="fa-headset" title="No ticket activity yet" text="Support-related activity will appear here as staff work happens." />}
            />
          </Panel>

          <Panel title="Ticket Health" badge={`${tickets.resolutionTimeHours || 0}h avg`} badgeColor="#4CC9A6">
            <KeyValueList
              items={[
                { label: "Open tickets", value: tickets.open || 0, color: accent },
                { label: "Closed tickets", value: tickets.closed || 0, color: "#4CC9A6" },
                { label: "Pending tickets", value: tickets.pending || 0, color: "#F59E0B" },
                { label: "Escalated tickets", value: tickets.escalated || 0, color: "#F06B8D" },
                { label: "High priority alerts", value: tickets.priorityDistribution?.high || 0, color: "#F06B8D" },
                { label: "Avg resolution time", value: `${tickets.resolutionTimeHours || 0}h`, color: "#5B7FE5" },
              ]}
            />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Panel title="Application Trend" badge={`${applications.pending || 0} pending`} badgeColor="#F06B8D">
            <MiniBars data={applications.trend || []} color={accent} />
          </Panel>

          <Panel title="Communication Performance" badge={`${communications.messages24h || 0} msgs / 24h`} badgeColor="#5B7FE5">
            <MiniBars data={analytics.communicationPerformance || []} color="#5B7FE5" />
            <div style={{ marginTop: "1rem" }}>
              <KeyValueList
                items={[
                  { label: "Internal messages", value: communications.internalMessages || 0, color: accent },
                  { label: "External messages", value: communications.externalMessages || 0, color: "#4CC9A6" },
                  { label: "Unread queue", value: communications.unreadMessageCount || 0, color: "#F59E0B" },
                  { label: "Read receipt rate", value: `${communications.readReceiptRate || 0}%`, color: "#5B7FE5" },
                ]}
              />
            </div>
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "1rem" }}>
          <Panel title="Pending Applications Queue" badge={`${applications.total || 0} total`} badgeColor={accent}>
            <TableLite
              columns={[
                {
                  key: "createdAt",
                  label: "Submitted",
                  render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => (
                    <span style={{ color: row.status === "pending" ? "#F59E0B" : row.status === "approved" ? "#4CC9A6" : "#F06B8D", fontWeight: 700 }}>
                      {row.status || "pending"}
                    </span>
                  ),
                },
                {
                  key: "reviewedAt",
                  label: "Reviewed",
                  render: (row) => (row.reviewedAt ? new Date(row.reviewedAt).toLocaleDateString() : "Awaiting review"),
                },
              ]}
              rows={applications.queue || []}
              emptyText="No pending applications right now."
            />
          </Panel>

          <Panel title="Announcements Snapshot" badge={`${announcements.active || 0} active`} badgeColor="#5B7FE5">
            <KeyValueList
              items={[
                { label: "Active announcements", value: announcements.active || 0, color: "#5B7FE5" },
                { label: "Expired announcements", value: announcements.expired || 0, color: "#F59E0B" },
                { label: "Read notices", value: announcements.read || 0, color: "#4CC9A6" },
                { label: "Unread notices", value: announcements.unread || 0, color: "#F06B8D" },
                { label: "Engagement rate", value: `${announcements.engagementRate || 0}%`, color: accent },
              ]}
            />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <Panel title="Task Performance" badge={`${tasks.productivityScore || 0}% productivity`} badgeColor="#4CC9A6">
            <KeyValueList
              items={[
                { label: "Assigned work", value: tasks.assigned || 0, color: accent },
                { label: "Completed work", value: tasks.completed || 0, color: "#4CC9A6" },
                { label: "Overdue work", value: tasks.overdue || 0, color: "#F06B8D" },
                { label: "Upcoming work", value: tasks.upcoming || 0, color: "#F59E0B" },
              ]}
            />
          </Panel>

          <Panel title="Records & Search" badge={`${data?.records?.totalRecords || 0} records`} badgeColor="#F59E0B">
            <KeyValueList
              items={[
                { label: "Recently updated", value: data?.records?.recentlyUpdated || 0, color: accent },
                { label: "Archived records", value: data?.records?.archivedRecords || 0, color: "#F59E0B" },
                { label: "Access logs", value: data?.records?.accessLogs || 0, color: "#5B7FE5" },
                { label: "Searchable collections", value: data?.records?.searchAnalytics?.activeCollections || 0, color: "#4CC9A6" },
              ]}
            />
          </Panel>

          <Panel title="My Secretary Profile" badge={`${profile.performanceMetrics?.actionsLogged || 0} actions`} badgeColor={accent}>
            <KeyValueList
              items={[
                { label: "Role", value: profile.account?.role || "secretary", color: accent },
                { label: "Responsibilities", value: profile.performanceMetrics?.responsibilitiesCount || 0, color: "#4CC9A6" },
                { label: "Unread personal notifications", value: profile.performanceMetrics?.unreadNotifications || 0, color: "#F59E0B" },
                { label: "Member since", value: profile.account?.createdAt ? new Date(profile.account.createdAt).toLocaleDateString() : "—", color: "#5B7FE5" },
              ]}
            />
          </Panel>
        </div>
      </div>
    </SecretaryLayout>
  );
}

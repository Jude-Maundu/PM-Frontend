import React from "react";
import EngineerLayout from "./EngineerLayout";
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

const accent = "#06B6D4";

export default function EngineerDash() {
  const { data, loading, error, refreshing, lastUpdated, refresh } = useStaffDashboard("engineer");

  if (loading && !data) {
    return (
      <EngineerLayout>
        <DashboardSkeleton accent={accent} />
      </EngineerLayout>
    );
  }

  const overview = data?.overview || {};
  const systemStatus = data?.systemStatus || {};
  const performance = data?.performance || {};
  const database = data?.database || {};
  const security = data?.security || {};
  const analytics = data?.analytics || {};
  const profile = data?.profile || {};

  return (
    <EngineerLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <DashboardHeader
          title="Engineering Command Center"
          subtitle="Live infrastructure, reliability, security, and performance visibility sourced from backend state and production records."
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
            { label: "Uptime Hours", value: overview.uptimeHours || 0, note: "Current server process uptime", icon: "fa-clock", color: accent },
            { label: "Online Services", value: overview.onlineServices || 0, note: "API, DB, realtime, uploads", icon: "fa-server", color: "#4CC9A6" },
            { label: "Active Incidents", value: overview.activeIncidents || 0, note: "Failures and critical signals", icon: "fa-triangle-exclamation", color: "#F06B8D" },
            { label: "Connected Users", value: overview.connectedUsers || 0, note: "Realtime socket presence", icon: "fa-users", color: "#5B7FE5" },
          ]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "1rem" }}>
          <Panel title="Service Status" badge={`${overview.offlineServices || 0} offline`} badgeColor={overview.offlineServices ? "#F06B8D" : "#4CC9A6"}>
            <TableLite
              columns={[
                { key: "name", label: "Service" },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => (
                    <span style={{ color: row.status === "online" ? "#4CC9A6" : row.status === "connecting" ? "#F59E0B" : "#F06B8D", fontWeight: 700 }}>
                      {row.status}
                    </span>
                  ),
                },
                { key: "detail", label: "Detail" },
              ]}
              rows={systemStatus.services || []}
              emptyText="No service telemetry is available."
            />
          </Panel>

          <Panel title="Performance Snapshot" badge={`${analytics.systemHealthScore || 0} health`} badgeColor={accent}>
            <KeyValueList
              items={[
                { label: "CPU load (1m)", value: performance.cpuLoad1m || 0, color: accent },
                { label: "Memory usage", value: `${performance.memoryUsagePct || 0}%`, color: "#F59E0B" },
                { label: "API health score", value: performance.apiResponseHealthScore || 0, color: "#4CC9A6" },
                { label: "Connected sockets", value: data?.live?.connectedUsers || 0, color: "#5B7FE5" },
              ]}
            />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Panel title="Infrastructure Trend" badge={`${analytics.reliabilityScore || 0} reliability`} badgeColor="#4CC9A6">
            <MiniBars data={analytics.infrastructureTrends || []} color={accent} />
          </Panel>

          <Panel title="Error Trend" badge={`${data?.errors?.critical || 0} critical`} badgeColor="#F06B8D">
            <MiniBars data={analytics.errorTrends || []} color="#F06B8D" />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "1rem" }}>
          <Panel title="Audit & Error Feed" badge={`${data?.logs?.errorLogs?.length || 0} flagged`} badgeColor="#F06B8D">
            <ActivityList
              items={(data?.logs?.applicationLogs || []).map((item) => ({
                ...item,
                title: (item.action || "activity").replace(/_/g, " "),
                message: `${item.actor || "System"} • ${item.entityType || "event"}`,
              }))}
              empty={<EmptyState icon="fa-terminal" title="No system activity logs" text="Audit and operational events will appear here." />}
            />
          </Panel>

          <Panel title="Security Center" badge={`${security.suspiciousActivities || 0} alerts`} badgeColor="#F06B8D">
            <KeyValueList
              items={[
                { label: "Tracked login/admin events", value: security.loginAttemptsTracked || 0, color: accent },
                { label: "Suspicious activities", value: security.suspiciousActivities || 0, color: "#F06B8D" },
                { label: "Banned users + pending risk", value: security.accessControlMonitoring?.bannedUsers || 0, color: "#F59E0B" },
                { label: "Pending applications", value: security.accessControlMonitoring?.pendingApplications || 0, color: "#5B7FE5" },
              ]}
            />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <Panel title="Database Monitoring" badge={database.health || "unknown"} badgeColor={database.health === "online" ? "#4CC9A6" : "#F06B8D"}>
            <KeyValueList
              items={[
                { label: "Active connections", value: database.activeConnections || 0, color: accent },
                { label: "Collections", value: database.storageUtilization?.collections || 0, color: "#5B7FE5" },
                { label: "Data size", value: database.storageUtilization?.dataSize || 0, color: "#F59E0B" },
                { label: "Storage size", value: database.storageUtilization?.storageSize || 0, color: "#4CC9A6" },
              ]}
            />
          </Panel>

          <Panel title="CDN & Asset Delivery" badge={`${data?.cdn?.assetDelivery?.mediaCount || 0} media`} badgeColor="#5B7FE5">
            <KeyValueList
              items={[
                { label: "Total media views", value: data?.cdn?.assetDelivery?.totalViews || 0, color: accent },
                { label: "Total downloads", value: data?.cdn?.assetDelivery?.totalDownloads || 0, color: "#4CC9A6" },
                { label: "Album count", value: data?.cdn?.assetDelivery?.albumCount || 0, color: "#F59E0B" },
                { label: "Cache hit rate", value: `${data?.cdn?.cacheHitRate || 0}%`, color: "#F06B8D" },
              ]}
            />
          </Panel>

          <Panel title="Engineer Profile" badge={`${profile.incidentResponseMetrics?.actionsLogged || 0} actions`} badgeColor={accent}>
            <KeyValueList
              items={[
                { label: "Assigned systems", value: (profile.assignedSystems || []).length, color: accent },
                { label: "Critical events reviewed", value: profile.incidentResponseMetrics?.criticalEventsReviewed || 0, color: "#F06B8D" },
                { label: "Performance score", value: analytics.performanceScore || 0, color: "#4CC9A6" },
                { label: "Security score", value: analytics.securityScore || 0, color: "#5B7FE5" },
              ]}
            />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Panel title="M-Pesa & Error Signals" badge={`${data?.errors?.active || 0} active`} badgeColor="#F06B8D">
            <TableLite
              columns={[
                { key: "createdAt", label: "Time", render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "—") },
                { key: "status", label: "Status", render: (row) => row.status || row.ResultCode || "log" },
                { key: "amount", label: "Amount", render: (row) => row.amount || "—" },
              ]}
              rows={[...(data?.logs?.mpesaLogs || []).slice(0, 4), ...(data?.errors?.resolutionHistory || []).slice(0, 4)]}
              emptyText="No payment or refund error signals are available."
            />
          </Panel>

          <Panel title="Backups & Deployments" badge={data?.deployments?.currentReleaseVersion || "unknown"} badgeColor="#F59E0B">
            {(data?.backups?.history || []).length === 0 && !(data?.deployments?.history || []).length ? (
              <EmptyState icon="fa-cloud-upload-alt" title="No backup/deployment history tracked yet" text="The current backend has no dedicated backup or CI/CD history models." />
            ) : (
              <ActivityList
                items={data?.deployments?.history || []}
                empty={<EmptyState icon="fa-rocket" title="No deployment history" text="Deployment events will appear when they are logged." />}
              />
            )}
          </Panel>
        </div>
      </div>
    </EngineerLayout>
  );
}

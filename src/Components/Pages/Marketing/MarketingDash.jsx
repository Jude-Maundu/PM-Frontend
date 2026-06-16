import React from "react";
import MarketingLayout from "./MarketingLayout";
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

const accent = "#F59E0B";

export default function MarketingDash() {
  const { data, loading, error, refreshing, lastUpdated, refresh } = useStaffDashboard("marketing");

  if (loading && !data) {
    return (
      <MarketingLayout>
        <DashboardSkeleton accent={accent} />
      </MarketingLayout>
    );
  }

  const overview = data?.overview || {};
  const campaigns = data?.campaigns || {};
  const analytics = data?.analytics || {};
  const revenue = data?.revenue || {};
  const referrals = data?.referrals || {};
  const insights = data?.customerInsights || {};
  const marketingAnalytics = data?.marketingAnalytics || {};

  return (
    <MarketingLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <DashboardHeader
          title="Marketing Intelligence Hub"
          subtitle="Live campaign, revenue, referral, content, and audience insight data driven directly from backend records."
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
            { label: "Active Campaigns", value: overview.activeCampaigns || 0, note: "Admin/system broadcast activity", icon: "fa-bullseye", color: accent },
            { label: "Live Conversions", value: overview.liveConversions || 0, note: "Completed payments in live data", icon: "fa-bolt", color: "#4CC9A6" },
            { label: "Total Revenue", value: `KES ${Number(overview.totalRevenue || 0).toLocaleString()}`, note: "Completed payment volume", icon: "fa-dollar-sign", color: "#5B7FE5" },
            { label: "Referral Users", value: overview.referredUsers || 0, note: "Users joined through referral links", icon: "fa-gift", color: "#F06B8D" },
          ]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "1rem" }}>
          <Panel title="Growth Trend" badge={`${overview.totalUsers || 0} users`} badgeColor={accent}>
            <MiniBars data={data?.trends?.growth || []} color={accent} />
          </Panel>

          <Panel title="Campaign Snapshot" badge={`${campaigns.active || 0} active`} badgeColor="#4CC9A6">
            <KeyValueList
              items={[
                { label: "Active broadcasts", value: campaigns.active || 0, color: accent },
                { label: "Completed broadcasts", value: campaigns.completed || 0, color: "#5B7FE5" },
                { label: "Read rate", value: `${campaigns.performance?.readRate || 0}%`, color: "#4CC9A6" },
                { label: "Conversion tracking", value: campaigns.conversionTracking || 0, color: "#F06B8D" },
              ]}
            />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Panel title="Revenue Trend" badge={`KES ${Number(revenue.monthly || 0).toLocaleString()} monthly`} badgeColor="#5B7FE5">
            <MiniBars data={revenue.daily || []} color="#5B7FE5" />
          </Panel>

          <Panel title="Referral Trend" badge={`${referrals.conversions || 0} conversions`} badgeColor="#F06B8D">
            <MiniBars data={referrals.trend || []} color="#F06B8D" />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "1rem" }}>
          <Panel title="Top Content Performance" badge={`${data?.contentPerformance?.topContent?.length || 0} ranked`} badgeColor={accent}>
            <TableLite
              columns={[
                { key: "title", label: "Content" },
                { key: "views", label: "Views" },
                { key: "downloads", label: "Downloads" },
                { key: "roi", label: "ROI", render: (row) => `KES ${Number(row.roi || 0).toLocaleString()}` },
              ]}
              rows={data?.contentPerformance?.topContent || []}
              emptyText="No content performance data is available yet."
            />
          </Panel>

          <Panel title="Audience & Insights" badge={`${Object.keys(insights.demographics || {}).length} audience groups`} badgeColor="#4CC9A6">
            <KeyValueList
              items={[
                { label: "Traffic proxy", value: analytics.websiteTrafficProxy || 0, color: accent },
                { label: "User engagement", value: analytics.userEngagement || 0, color: "#4CC9A6" },
                { label: "Referral channel users", value: analytics.acquisitionChannels?.referrals || 0, color: "#F06B8D" },
                { label: "Direct signups", value: analytics.acquisitionChannels?.directSignups || 0, color: "#5B7FE5" },
              ]}
            />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <Panel title="Push & Broadcast Performance" badge={`${data?.pushNotifications?.sent || 0} sent`} badgeColor="#5B7FE5">
            <KeyValueList
              items={[
                { label: "Delivered", value: data?.pushNotifications?.delivered || 0, color: "#4CC9A6" },
                { label: "Open rate", value: `${data?.pushNotifications?.openRate || 0}%`, color: accent },
                { label: "Click rate", value: `${data?.pushNotifications?.clickThroughRate || 0}%`, color: "#F06B8D" },
                { label: "Device analytics", value: (data?.pushNotifications?.deviceAnalytics || []).length, color: "#5B7FE5" },
              ]}
            />
          </Panel>

          <Panel title="Revenue Metrics" badge={`KES ${Number(revenue.adminRevenue || 0).toLocaleString()} admin share`} badgeColor="#4CC9A6">
            <KeyValueList
              items={[
                { label: "Weekly revenue", value: `KES ${Number(revenue.growth || 0).toLocaleString()}`, color: accent },
                { label: "Lifetime value proxy", value: `KES ${Number(revenue.lifetimeValueProxy || 0).toLocaleString()}`, color: "#5B7FE5" },
                { label: "Forecast", value: `KES ${Number(revenue.forecast || 0).toLocaleString()}`, color: "#4CC9A6" },
                { label: "Referral revenue", value: `KES ${Number(referrals.revenue || 0).toLocaleString()}`, color: "#F06B8D" },
              ]}
            />
          </Panel>

          <Panel title="Marketing Profile" badge={`${data?.profile?.teamContributions || 0} contributions`} badgeColor={accent}>
            <KeyValueList
              items={[
                { label: "Campaign ownership", value: data?.profile?.campaignOwnership || 0, color: accent },
                { label: "Weekly KPI revenue", value: `KES ${Number(data?.profile?.goalsAndKpis?.weeklyRevenue || 0).toLocaleString()}`, color: "#4CC9A6" },
                { label: "Weekly referrals", value: data?.profile?.goalsAndKpis?.weeklyReferrals || 0, color: "#F06B8D" },
                { label: "Live conversions", value: marketingAnalytics.liveConversions || 0, color: "#5B7FE5" },
              ]}
            />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "1rem" }}>
          <Panel title="Referral Leaderboard" badge={`${(referrals.leaderboard || []).length} ranked`} badgeColor="#F06B8D">
            <TableLite
              columns={[
                { key: "username", label: "User" },
                { key: "referralCode", label: "Code" },
                { key: "referralEarnings", label: "Earnings", render: (row) => `KES ${Number(row.referralEarnings || 0).toLocaleString()}` },
              ]}
              rows={referrals.leaderboard || []}
              emptyText="No referral leaderboard data yet."
            />
          </Panel>

          <Panel title="AI Insights & Recommendations" badge={`${(marketingAnalytics.aiInsights || []).length} insights`} badgeColor={accent}>
            <ActivityList
              items={(marketingAnalytics.aiInsights || []).map((message, index) => ({
                id: index,
                title: `Insight ${index + 1}`,
                message,
                createdAt: lastUpdated,
              }))}
              empty={<EmptyState icon="fa-lightbulb" title="No recommendations yet" text="Insights will appear once enough marketing data is available." />}
            />
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Panel title="Geographic Distribution" badge={`${(insights.geographicDistribution || []).length} regions`} badgeColor="#5B7FE5">
            {(insights.geographicDistribution || []).length ? (
              <KeyValueList
                items={(insights.geographicDistribution || []).map((item) => ({
                  label: item.location,
                  value: item.count,
                  color: accent,
                }))}
              />
            ) : (
              <EmptyState icon="fa-earth-africa" title="No location data yet" text="Geographic insights will appear once users have saved location data." />
            )}
          </Panel>

          <Panel title="Live Marketing Activity" badge={`${(data?.activityFeed || []).length} recent`} badgeColor="#4CC9A6">
            <ActivityList
              items={(data?.activityFeed || []).map((item, index) => ({
                id: item._id || index,
                title: item.title || "Broadcast activity",
                message: item.message || "Marketing notification",
                createdAt: item.createdAt,
              }))}
              empty={<EmptyState icon="fa-bullhorn" title="No live marketing activity" text="Broadcast and outreach activity will appear here as soon as it exists." />}
            />
          </Panel>
        </div>
      </div>
    </MarketingLayout>
  );
}

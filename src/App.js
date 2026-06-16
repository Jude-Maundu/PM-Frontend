import './App.css';
import './styles/mobileStyles.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from './context/ThemeContext';
import '@fortawesome/fontawesome-free/css/all.min.css'
import ToastContainer from './Components/ToastContainer';
import ConfirmDialog from './Components/ConfirmDialog';
import { HelmetProvider } from 'react-helmet-async';

// Public Pages
import Login from './Components/Pages/Login';
import Register from './Components/Pages/Register';
import AuthCallback from './Components/AuthCallback';
import ForgotPassword from './Components/Pages/ForgotPassword';
import ResetPassword from './Components/Pages/ResetPassword';
import EmailVerification from './Components/Pages/EmailVerification';

// Protected Route Component
import ProtectedRoute from './Components/ProtectedRoute';
import ErrorBoundary from './Components/ErrorBoundary';

// Admin Pages
import AdminDash from './Components/Pages/Admin/AdminDash';
import AdminAnalytics from './Components/Pages/Admin/AdminAnalytics';
import AdminModeration from './Components/Pages/Admin/AdminModeration';
import AdminMedia from './Components/Pages/Admin/AdminMedia';
import AdminUser from './Components/Pages/Admin/AdminUser';
import AdminReceipts from './Components/Pages/Admin/AdminReceipts';
import AdminRefunds from './Components/Pages/Admin/AdminRefunds';
import AdminSettings from './Components/Pages/Admin/AdminSettings';
import AdminAudit from './Components/Pages/Admin/AdminAudit';
import AdminShares from './Components/Pages/Admin/AdminShares';
import AdminWithdrawals from './Components/Pages/Admin/AdminWithdrawals';
import AdminAlbums from './Components/Pages/Admin/AdminAlbums';
import AdminWallets from './Components/Pages/Admin/AdminWallets';
import AdminPortfolios from './Components/Pages/Admin/AdminPortfolios';
import AdminProfile from './Components/Pages/Admin/AdminProfile';
import AdminConfig from './Components/Pages/Admin/AdminConfig';
import AdminApplications from './Components/Pages/Admin/AdminApplications';
import AdminLogs from './Components/Pages/Admin/AdminLogs';
import AdminStaff from './Components/Pages/Admin/AdminStaff';
import AdminNotifications from './Components/Pages/Admin/AdminNotifications';
import AdminMediaApproval from './Components/Pages/Admin/AdminMediaApproval';
import ShareAccess from './Components/Pages/Buyer/ShareAccess';

// Staff Role Dashboards
import SecretaryDash from './Components/Pages/Secretary/SecretaryDash';
import SecretaryLayout from './Components/Pages/Secretary/SecretaryLayout';
import SecretaryNotifications from './Components/Pages/Secretary/SecretaryNotifications';
import EngineerDash from './Components/Pages/Engineer/EngineerDash';
import EngineerLayout from './Components/Pages/Engineer/EngineerLayout';
import MarketingDash from './Components/Pages/Marketing/MarketingDash';
import MarketingLayout from './Components/Pages/Marketing/MarketingLayout';
import StaffWorkspacePage from './Components/Pages/Shared/StaffWorkspacePage';

// Photographer Pages
import PhotographerPortfolio from './Components/Pages/Photographer/PhotographerPortfolio';
import PublicPortfolio from './Components/Pages/Portfolio/PublicPortfolio';
import PhotographerDash from './Components/Pages/Photographer/PhotographerDash';
import PhotographerEarnings from './Components/Pages/Photographer/Earnings';
import PhotographerMedia from './Components/Pages/Photographer/MyMedia';
import PhotographerProfile from './Components/Pages/Photographer/Profile';
import PhotographerSales from './Components/Pages/Photographer/SalesHistory';
import PhotographerUpload from './Components/Pages/Photographer/UploadMedia';
import PhotographerWithdrawals from './Components/Pages/Photographer/Withdrawals';
import PhotographerSettings from './Components/Pages/Photographer/PhotographerSettings';
import SalesAnalytics from './Components/Pages/Photographer/SalesAnalytics';
import ReferralPage from './Components/Pages/Photographer/ReferralPage';
import CreateAlbum from './Components/Pages/Photographer/CreateAlbum';
import MyAlbums from './Components/Pages/Photographer/MyAlbums';
import AlbumManage from './Components/Pages/Photographer/AlbumManage';
import PublicAlbumView from './Components/Pages/Public/PublicAlbumView';

// BuyerPages 
import BuyerCart from './Components/Pages/Buyer/BuyerCart';
import BuyerDashboard from './Components/Pages/Buyer/BuyerDash';
import BuyerTransactions from './Components/Pages/Buyer/BuyerTransaction';
import BuyerDownloads from './Components/Pages/Buyer/BuyerDownloads';
import BuyerFavorites from './Components/Pages/Buyer/BuyerFavourite';
import BuyerProfile from './Components/Pages/Buyer/BuyerProfile';
import BuyerWallet from './Components/Pages/Buyer/BuyerWallet';
import BuyerExplore from './Components/Pages/Buyer/BuyerExplore';
import BuyerSettings from './Components/Pages/Buyer/BuyerSettings';
import BuyerAlbumAccess from './Components/Pages/Buyer/BuyerAlbumAccess';
import BuyerReferralPage from './Components/Pages/Buyer/BuyerReferralPage';
import Explore from './Components/Pages/Explore';
import HomePage from './Components/Pages/HomePage';
import ClientProofing from './Components/Pages/Photographer/ClientProofing';
import ClientProofingView from './Components/Pages/Proofing/ClientProofingView';
import OnboardingWizard from './Components/OnboardingWizard';
import PublicGallery from './Components/Pages/Public/PublicGallery';

const secretaryRoutes = [
  {
    path: '/secretary/tickets',
    title: 'Support Tickets',
    subtitle: 'Track customer issues, route conversations, and keep follow-ups organized.',
    icon: 'fa-headset',
    accent: '#8B5CF6',
    stats: [
      { label: 'Queue Focus', value: 'Inbox', note: 'Customer issues and follow-up', icon: 'fa-inbox', color: '#8B5CF6' },
      { label: 'Priority', value: 'Fast', note: 'Keep response times short', icon: 'fa-bolt', color: '#F59E0B' },
      { label: 'Escalations', value: 'Ready', note: 'Push complex issues to admin', icon: 'fa-level-up-alt', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Review open issues', text: 'Use this area to triage buyer, photographer, and platform support requests in one place.', icon: 'fa-ticket-alt' },
      { title: 'Capture context clearly', text: 'Document issue summaries, promised callbacks, and the next responsible teammate before closing a case.', icon: 'fa-clipboard-list' },
      { title: 'Escalate blockers early', text: 'Hand off billing, moderation, or technical incidents quickly so customers are not left waiting.', icon: 'fa-share-square' },
    ],
    shortcuts: [
      { to: '/secretary/communications', label: 'Open Communications', icon: 'fa-envelope', primary: true },
      { to: '/secretary/notifications', label: 'View Notifications', icon: 'fa-bell' },
      { to: '/secretary/tasks', label: 'Review Tasks', icon: 'fa-tasks' },
    ],
  },
  {
    path: '/secretary/schedule',
    title: 'Schedule',
    subtitle: 'Coordinate internal follow-ups, application reviews, and support handoffs.',
    icon: 'fa-calendar-alt',
    accent: '#8B5CF6',
    stats: [
      { label: 'Cadence', value: 'Daily', note: 'Check-ins and follow-ups', icon: 'fa-calendar-day', color: '#8B5CF6' },
      { label: 'Coordination', value: 'Team', note: 'Align admin and support work', icon: 'fa-users', color: '#5B7FE5' },
      { label: 'Timing', value: 'Live', note: 'Keep operational deadlines visible', icon: 'fa-clock', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Plan review windows', text: 'Reserve time for pending applications, unresolved tickets, and high-priority customer follow-up.', icon: 'fa-stopwatch' },
      { title: 'Coordinate internal events', text: 'Use the schedule to sync announcements, launches, or maintenance notices across teams.', icon: 'fa-calendar-check' },
      { title: 'Reduce missed handoffs', text: 'Keep recurring admin tasks visible so support work does not slip through the cracks.', icon: 'fa-link' },
    ],
    shortcuts: [
      { to: '/secretary/tasks', label: 'Open Task Manager', icon: 'fa-tasks', primary: true },
      { to: '/secretary/announcements', label: 'Prepare Announcements', icon: 'fa-bullhorn' },
    ],
  },
  {
    path: '/secretary/announcements',
    title: 'Announcements',
    subtitle: 'Prepare internal and customer-facing updates for launches, maintenance, and policy changes.',
    icon: 'fa-bullhorn',
    accent: '#8B5CF6',
    stats: [
      { label: 'Audience', value: 'Platform', note: 'Staff, buyers, and photographers', icon: 'fa-broadcast-tower', color: '#8B5CF6' },
      { label: 'Use Case', value: 'Updates', note: 'Policies, events, reminders', icon: 'fa-newspaper', color: '#F06B8D' },
      { label: 'Channel', value: 'Multi', note: 'Dashboard and notification ready', icon: 'fa-paper-plane', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Draft clear notices', text: 'Write short updates for service changes, application status reminders, and event timelines.', icon: 'fa-pen' },
      { title: 'Keep teams aligned', text: 'Coordinate messaging with admin and engineering when a change affects customer experience.', icon: 'fa-people-arrows' },
      { title: 'Store reusable wording', text: 'Build a library of trusted announcement formats for repeat operational events.', icon: 'fa-copy' },
    ],
    shortcuts: [
      { to: '/secretary/notifications', label: 'Open Notifications', icon: 'fa-bell', primary: true },
      { to: '/secretary/communications', label: 'Review Communications', icon: 'fa-envelope' },
    ],
  },
  {
    path: '/secretary/reports',
    title: 'Reports',
    subtitle: 'Summarize operational health, response quality, and workflow progress for the team.',
    icon: 'fa-file-alt',
    accent: '#8B5CF6',
    stats: [
      { label: 'Reporting', value: 'Weekly', note: 'Ops and support summaries', icon: 'fa-chart-pie', color: '#8B5CF6' },
      { label: 'Coverage', value: 'Cross-team', note: 'Support, apps, notifications', icon: 'fa-layer-group', color: '#5B7FE5' },
      { label: 'Outcome', value: 'Clarity', note: 'Spot blockers earlier', icon: 'fa-search', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Track recurring pain points', text: 'Capture the most common support requests and delayed workflows so the team can improve them.', icon: 'fa-clipboard-check' },
      { title: 'Share operational snapshots', text: 'Use reports to brief leadership on ticket volume, approvals, and communication load.', icon: 'fa-share-alt' },
      { title: 'Turn patterns into action', text: 'Highlight what needs automation, policy changes, or clearer customer messaging.', icon: 'fa-lightbulb' },
    ],
    shortcuts: [
      { to: '/secretary/records', label: 'View Records', icon: 'fa-folder-open', primary: true },
      { to: '/secretary/applications', label: 'Check Applications', icon: 'fa-user-clock' },
    ],
  },
  {
    path: '/secretary/applications',
    title: 'Applications',
    subtitle: 'Review photographer onboarding flow and coordinate the next action for pending applicants.',
    icon: 'fa-user-clock',
    accent: '#8B5CF6',
    stats: [
      { label: 'Focus', value: 'Onboarding', note: 'Photographer application intake', icon: 'fa-id-badge', color: '#8B5CF6' },
      { label: 'Goal', value: 'Timely', note: 'Reduce wait time for applicants', icon: 'fa-hourglass-half', color: '#F59E0B' },
      { label: 'Flow', value: 'Review', note: 'Ready for admin collaboration', icon: 'fa-random', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Validate submissions', text: 'Check incoming application completeness before escalation or decision review.', icon: 'fa-check-double' },
      { title: 'Keep applicants informed', text: 'Use coordinated communication to avoid silent waiting periods for creators joining the platform.', icon: 'fa-comments' },
      { title: 'Support decision trails', text: 'Preserve clear notes so approval and rejection outcomes stay understandable and auditable.', icon: 'fa-book' },
    ],
    shortcuts: [
      { to: '/admin/applications', label: 'Open Admin Applications', icon: 'fa-user-shield', primary: true },
      { to: '/secretary/communications', label: 'Prepare Outreach', icon: 'fa-envelope' },
    ],
  },
  {
    path: '/secretary/communications',
    title: 'Communications',
    subtitle: 'Organize messages, follow-ups, and internal coordination across staff and customers.',
    icon: 'fa-envelope',
    accent: '#8B5CF6',
    stats: [
      { label: 'Inbox Style', value: 'Unified', note: 'Customer and internal updates', icon: 'fa-inbox', color: '#8B5CF6' },
      { label: 'Tone', value: 'Clear', note: 'Operational communication first', icon: 'fa-comment-dots', color: '#5B7FE5' },
      { label: 'Goal', value: 'Responsive', note: 'Avoid missed replies', icon: 'fa-reply', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Centralize outreach', text: 'Prepare responses for onboarding questions, support follow-ups, and internal reminders.', icon: 'fa-mail-bulk' },
      { title: 'Keep records searchable', text: 'Communication notes should make it easy to understand the latest status for any request.', icon: 'fa-search-plus' },
      { title: 'Promote confidence', text: 'Consistent messaging improves trust when buyers and photographers need updates.', icon: 'fa-handshake' },
    ],
    shortcuts: [
      { to: '/secretary/notifications', label: 'Open Notifications', icon: 'fa-bell', primary: true },
      { to: '/secretary/tickets', label: 'Back to Tickets', icon: 'fa-headset' },
    ],
  },
  {
    path: '/secretary/records',
    title: 'Records',
    subtitle: 'Maintain organized operational history for applications, support actions, and announcements.',
    icon: 'fa-folder-open',
    accent: '#8B5CF6',
    stats: [
      { label: 'Storage', value: 'Operational', note: 'Applications, updates, and notes', icon: 'fa-archive', color: '#8B5CF6' },
      { label: 'Need', value: 'Traceable', note: 'Reliable handoff history', icon: 'fa-fingerprint', color: '#5B7FE5' },
      { label: 'Benefit', value: 'Audit-ready', note: 'Fewer lost details', icon: 'fa-shield-alt', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Keep paper trails clean', text: 'Store decisions, message context, and status changes so the team always has continuity.', icon: 'fa-file-signature' },
      { title: 'Support compliance habits', text: 'Good records make reviews and escalation handling much easier later.', icon: 'fa-balance-scale' },
      { title: 'Reduce duplicated work', text: 'A strong record trail prevents teammates from re-asking solved questions.', icon: 'fa-history' },
    ],
    shortcuts: [
      { to: '/secretary/reports', label: 'Open Reports', icon: 'fa-file-alt', primary: true },
      { to: '/secretary/tasks', label: 'Review Task Manager', icon: 'fa-tasks' },
    ],
  },
  {
    path: '/secretary/tasks',
    title: 'Task Manager',
    subtitle: 'Keep operational work visible, prioritized, and easy to hand off.',
    icon: 'fa-tasks',
    accent: '#8B5CF6',
    stats: [
      { label: 'View', value: 'Action List', note: 'Daily operational follow-up', icon: 'fa-list-check', color: '#8B5CF6' },
      { label: 'Priority', value: 'Shared', note: 'Coordinate with staff quickly', icon: 'fa-users-cog', color: '#5B7FE5' },
      { label: 'Rhythm', value: 'Daily', note: 'Close loops before they age', icon: 'fa-sync', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Capture next actions', text: 'Turn tickets, applications, and announcements into concrete follow-up work.', icon: 'fa-thumbtack' },
      { title: 'Avoid forgotten promises', text: 'Visible tasks help the team keep callbacks and status updates on schedule.', icon: 'fa-bell' },
      { title: 'Improve handoff quality', text: 'Short, specific task notes make it easier for another teammate to pick up the work.', icon: 'fa-user-friends' },
    ],
    shortcuts: [
      { to: '/secretary/schedule', label: 'Open Schedule', icon: 'fa-calendar-alt', primary: true },
      { to: '/secretary/tickets', label: 'Review Tickets', icon: 'fa-headset' },
    ],
  },
  {
    path: '/secretary/profile',
    title: 'Secretary Profile',
    subtitle: 'Review account identity, role context, and role-specific navigation.',
    icon: 'fa-user',
    accent: '#8B5CF6',
    stats: [
      { label: 'Role', value: 'Secretary', note: 'Operations and coordination', icon: 'fa-user-tag', color: '#8B5CF6' },
      { label: 'Identity', value: 'Live', note: 'Reads the signed-in account', icon: 'fa-id-card', color: '#5B7FE5' },
      { label: 'Access', value: 'Scoped', note: 'Secretary routes only', icon: 'fa-lock', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Confirm account details', text: 'Use this page as the stable home for profile and role information in the secretary workspace.', icon: 'fa-user-circle' },
      { title: 'Keep navigation central', text: 'Profile pages are useful anchors when teammates need a safe, always-working route.', icon: 'fa-compass' },
      { title: 'Extend later with settings', text: 'This page is ready for preferences, signatures, or communication defaults when needed.', icon: 'fa-sliders-h' },
    ],
    shortcuts: [
      { to: '/secretary/dashboard', label: 'Back to Dashboard', icon: 'fa-th-large', primary: true },
      { to: '/secretary/notifications', label: 'Open Notifications', icon: 'fa-bell' },
    ],
  },
];

const engineerRoutes = [
  {
    path: '/engineer/status',
    title: 'System Status',
    subtitle: 'Keep a live operational view of platform reliability, service health, and risk signals.',
    icon: 'fa-heartbeat',
    accent: '#06B6D4',
    stats: [
      { label: 'Coverage', value: 'Platform', note: 'Health and uptime awareness', icon: 'fa-satellite-dish', color: '#06B6D4' },
      { label: 'Signal', value: 'Live', note: 'Fast incident awareness', icon: 'fa-wave-square', color: '#4CC9A6' },
      { label: 'Mode', value: 'Ops', note: 'Engineering response surface', icon: 'fa-tools', color: '#5B7FE5' },
    ],
    details: [
      { title: 'Watch reliability trends', text: 'Use this area for service health summaries, uptime checks, and incident visibility.', icon: 'fa-chart-line' },
      { title: 'Shorten response time', text: 'A clear status page helps engineering spot issues before they grow into customer-facing failures.', icon: 'fa-stopwatch' },
      { title: 'Coordinate escalations', text: 'Pair status monitoring with logs and error review to resolve incidents faster.', icon: 'fa-broadcast-tower' },
    ],
    shortcuts: [
      { to: '/engineer/logs', label: 'Open API Logs', icon: 'fa-terminal', primary: true },
      { to: '/engineer/errors', label: 'Review Error Reports', icon: 'fa-bug' },
    ],
  },
  {
    path: '/engineer/logs',
    title: 'API Logs',
    subtitle: 'Inspect request flow, operational traces, and backend behavior across the platform.',
    icon: 'fa-terminal',
    accent: '#06B6D4',
    stats: [
      { label: 'Type', value: 'Tracing', note: 'Requests, actions, and audits', icon: 'fa-stream', color: '#06B6D4' },
      { label: 'Use', value: 'Debug', note: 'Find failures faster', icon: 'fa-search', color: '#F59E0B' },
      { label: 'Depth', value: 'Backend', note: 'System behavior review', icon: 'fa-server', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Follow request history', text: 'Log review is the fastest way to understand what happened before and after a failure.', icon: 'fa-route' },
      { title: 'Compare healthy vs failing paths', text: 'Use repeatable traces to spot regression patterns and broken assumptions.', icon: 'fa-code-branch' },
      { title: 'Support deployment confidence', text: 'Reliable logs make rollback and release verification much safer.', icon: 'fa-clipboard-check' },
    ],
    shortcuts: [
      { to: '/engineer/errors', label: 'Open Error Reports', icon: 'fa-bug', primary: true },
      { to: '/engineer/deployments', label: 'Review Deployments', icon: 'fa-rocket' },
    ],
  },
  {
    path: '/engineer/errors',
    title: 'Error Reports',
    subtitle: 'Track critical failures, prioritize regressions, and protect release quality.',
    icon: 'fa-bug',
    accent: '#06B6D4',
    stats: [
      { label: 'Focus', value: 'Failures', note: 'Client and server issues', icon: 'fa-exclamation-triangle', color: '#F06B8D' },
      { label: 'Priority', value: 'Critical', note: 'Regression-first mindset', icon: 'fa-fire', color: '#06B6D4' },
      { label: 'Goal', value: 'Stable', note: 'Reduce production surprises', icon: 'fa-shield-virus', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Group incidents by impact', text: 'Separate high-severity production failures from lower-risk polish issues.', icon: 'fa-layer-group' },
      { title: 'Preserve reproduction clues', text: 'Capture environment, user path, and request context whenever possible.', icon: 'fa-notes-medical' },
      { title: 'Close the loop with fixes', text: 'Tie resolved incidents back to deployments and verification runs.', icon: 'fa-check-circle' },
    ],
    shortcuts: [
      { to: '/engineer/status', label: 'Back to Status', icon: 'fa-heartbeat', primary: true },
      { to: '/engineer/security', label: 'Open Security', icon: 'fa-shield-alt' },
    ],
  },
  {
    path: '/engineer/database',
    title: 'Database',
    subtitle: 'Organize data-health checks, storage reviews, and maintenance planning.',
    icon: 'fa-database',
    accent: '#06B6D4',
    stats: [
      { label: 'Domain', value: 'Data', note: 'Persistence and integrity', icon: 'fa-database', color: '#06B6D4' },
      { label: 'Risk', value: 'Medium', note: 'Schema drift and heavy queries', icon: 'fa-project-diagram', color: '#F59E0B' },
      { label: 'Goal', value: 'Healthy', note: 'Fast, safe data access', icon: 'fa-check-double', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Watch query pressure', text: 'Use this space for query analysis, index planning, and hot-path awareness.', icon: 'fa-stopwatch-20' },
      { title: 'Plan safe changes', text: 'Coordinate schema or retention updates with backups and rollout timing.', icon: 'fa-columns' },
      { title: 'Protect data quality', text: 'Track data anomalies before they turn into user-facing bugs.', icon: 'fa-shield-check' },
    ],
    shortcuts: [
      { to: '/engineer/backups', label: 'Open Backups', icon: 'fa-cloud-upload-alt', primary: true },
      { to: '/engineer/performance', label: 'Review Performance', icon: 'fa-tachometer-alt' },
    ],
  },
  {
    path: '/engineer/backups',
    title: 'Backups',
    subtitle: 'Keep recovery readiness visible and document restore confidence.',
    icon: 'fa-cloud-upload-alt',
    accent: '#06B6D4',
    stats: [
      { label: 'Need', value: 'Recovery', note: 'Protect production continuity', icon: 'fa-life-ring', color: '#06B6D4' },
      { label: 'Practice', value: 'Verified', note: 'Backups must be restorable', icon: 'fa-check', color: '#4CC9A6' },
      { label: 'Priority', value: 'High', note: 'Critical before deploy windows', icon: 'fa-exclamation', color: '#F59E0B' },
    ],
    details: [
      { title: 'Track backup cadence', text: 'Document when backups run and whether restore testing has been confirmed recently.', icon: 'fa-history' },
      { title: 'Reduce recovery uncertainty', text: 'A backup is only useful if the restore path is understood and tested.', icon: 'fa-undo-alt' },
      { title: 'Pair with deployment checks', text: 'Use backup readiness as part of release go/no-go discipline.', icon: 'fa-rocket' },
    ],
    shortcuts: [
      { to: '/engineer/deployments', label: 'Open Deployments', icon: 'fa-rocket', primary: true },
      { to: '/engineer/database', label: 'Review Database', icon: 'fa-database' },
    ],
  },
  {
    path: '/engineer/deployments',
    title: 'Deployments',
    subtitle: 'Coordinate release quality, rollout confidence, and rollback readiness.',
    icon: 'fa-rocket',
    accent: '#06B6D4',
    stats: [
      { label: 'Flow', value: 'Release', note: 'Ship safely and predictably', icon: 'fa-rocket', color: '#06B6D4' },
      { label: 'Guardrail', value: 'Rollback', note: 'Have a reversal path ready', icon: 'fa-undo' , color: '#F06B8D' },
      { label: 'Check', value: 'Verify', note: 'Post-deploy confidence matters', icon: 'fa-vial', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Record what shipped', text: 'Use this route to summarize changes, release notes, and linked incidents.', icon: 'fa-list-ul' },
      { title: 'Watch after rollout', text: 'Deployments need immediate monitoring across logs, errors, and customer-facing paths.', icon: 'fa-eye' },
      { title: 'Normalize rollback discipline', text: 'Safe releases are as much about fast reversibility as they are about new features.', icon: 'fa-shield-alt' },
    ],
    shortcuts: [
      { to: '/engineer/status', label: 'Open System Status', icon: 'fa-heartbeat', primary: true },
      { to: '/engineer/logs', label: 'Inspect Logs', icon: 'fa-terminal' },
    ],
  },
  {
    path: '/engineer/security',
    title: 'Security',
    subtitle: 'Track operational safeguards, access review, and platform hardening work.',
    icon: 'fa-shield-alt',
    accent: '#06B6D4',
    stats: [
      { label: 'Scope', value: 'Access', note: 'Roles, secrets, and controls', icon: 'fa-user-lock', color: '#06B6D4' },
      { label: 'Mindset', value: 'Preventive', note: 'Reduce exposure before incidents', icon: 'fa-lock', color: '#4CC9A6' },
      { label: 'Focus', value: 'Hygiene', note: 'Hardening and review', icon: 'fa-key', color: '#F59E0B' },
    ],
    details: [
      { title: 'Review privileged access', text: 'Use this page to organize role checks, token handling, and risky capability reviews.', icon: 'fa-user-shield' },
      { title: 'Protect sensitive flows', text: 'Prioritize withdrawals, payment callbacks, and admin actions for tighter review.', icon: 'fa-credit-card' },
      { title: 'Build repeatable hardening habits', text: 'Security gets stronger when checks become part of normal release work.', icon: 'fa-shield-check' },
    ],
    shortcuts: [
      { to: '/engineer/errors', label: 'Review Incident Reports', icon: 'fa-bug', primary: true },
      { to: '/engineer/profile', label: 'Open Engineer Profile', icon: 'fa-user-cog' },
    ],
  },
  {
    path: '/engineer/performance',
    title: 'Performance',
    subtitle: 'Track upload, download, query, and rendering bottlenecks that affect customer experience.',
    icon: 'fa-tachometer-alt',
    accent: '#06B6D4',
    stats: [
      { label: 'Focus', value: 'Speed', note: 'Frontend and backend performance', icon: 'fa-gauge-high', color: '#06B6D4' },
      { label: 'Impact', value: 'User-facing', note: 'Latency shapes trust', icon: 'fa-user-clock', color: '#F59E0B' },
      { label: 'Need', value: 'Measured', note: 'Use real bottleneck signals', icon: 'fa-ruler-combined', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Follow slow paths', text: 'Use this workspace for upload speed, download speed, and heavy dashboard bottleneck tracking.', icon: 'fa-stopwatch' },
      { title: 'Measure before and after', text: 'Performance work should be validated with clear baselines and follow-up checks.', icon: 'fa-chart-area' },
      { title: 'Prioritize real pain', text: 'Focus first on operations that block creators, buyers, or critical staff workflows.', icon: 'fa-crosshairs' },
    ],
    shortcuts: [
      { to: '/engineer/cdn', label: 'Open CDN & Assets', icon: 'fa-globe', primary: true },
      { to: '/engineer/database', label: 'Review Database', icon: 'fa-database' },
    ],
  },
  {
    path: '/engineer/cdn',
    title: 'CDN & Assets',
    subtitle: 'Organize media delivery, caching, and asset-path reliability work.',
    icon: 'fa-globe',
    accent: '#06B6D4',
    stats: [
      { label: 'Surface', value: 'Delivery', note: 'Images, albums, and static assets', icon: 'fa-image', color: '#06B6D4' },
      { label: 'Leverage', value: 'Caching', note: 'Reduce repeat load cost', icon: 'fa-bolt', color: '#4CC9A6' },
      { label: 'Risk', value: 'Broken URLs', note: 'Public path integrity matters', icon: 'fa-link', color: '#F06B8D' },
    ],
    details: [
      { title: 'Keep assets reachable', text: 'Use this route for image delivery, share links, and media-path troubleshooting.', icon: 'fa-photo-video' },
      { title: 'Improve transfer speed', text: 'Caching and media optimization are key to better upload and download experience.', icon: 'fa-wind' },
      { title: 'Protect global consistency', text: 'Customers should see the same reliable asset behavior across devices and regions.', icon: 'fa-network-wired' },
    ],
    shortcuts: [
      { to: '/engineer/performance', label: 'Back to Performance', icon: 'fa-tachometer-alt', primary: true },
      { to: '/engineer/status', label: 'Open Status', icon: 'fa-heartbeat' },
    ],
  },
  {
    path: '/engineer/profile',
    title: 'Engineer Profile',
    subtitle: 'Review the signed-in engineer account and keep a stable home route for engineering access.',
    icon: 'fa-user-cog',
    accent: '#06B6D4',
    stats: [
      { label: 'Role', value: 'Engineer', note: 'System maintenance access', icon: 'fa-user-cog', color: '#06B6D4' },
      { label: 'State', value: 'Signed In', note: 'Current account context', icon: 'fa-id-card', color: '#5B7FE5' },
      { label: 'Access', value: 'Scoped', note: 'Engineering routes only', icon: 'fa-lock', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Keep role context visible', text: 'This page gives engineering users a predictable route that always resolves correctly.', icon: 'fa-compass' },
      { title: 'Extend with settings later', text: 'It is ready for engineer-specific preferences or deployment notes when you want them.', icon: 'fa-cogs' },
      { title: 'Reduce dead-end navigation', text: 'A working profile route helps avoid the broken-button feeling users were hitting.', icon: 'fa-check-circle' },
    ],
    shortcuts: [
      { to: '/engineer/dashboard', label: 'Back to Dashboard', icon: 'fa-server', primary: true },
      { to: '/engineer/security', label: 'Open Security', icon: 'fa-shield-alt' },
    ],
  },
];

const marketingRoutes = [
  {
    path: '/marketing/campaigns',
    title: 'Campaigns',
    subtitle: 'Plan promotions, launches, and creator growth initiatives from one marketing workspace.',
    icon: 'fa-bullseye',
    accent: '#F59E0B',
    stats: [
      { label: 'Focus', value: 'Growth', note: 'Acquire and activate users', icon: 'fa-chart-line', color: '#F59E0B' },
      { label: 'Theme', value: 'Campaigns', note: 'Launches and seasonal pushes', icon: 'fa-bullhorn', color: '#4CC9A6' },
      { label: 'Need', value: 'Coordinated', note: 'Sync with product and ops', icon: 'fa-people-group', color: '#5B7FE5' },
    ],
    details: [
      { title: 'Organize campaign plans', text: 'Use this route for launch calendars, promotional objectives, and audience targeting notes.', icon: 'fa-map-signs' },
      { title: 'Align message and timing', text: 'Strong campaigns land better when content, support, and platform readiness are synchronized.', icon: 'fa-clock' },
      { title: 'Track follow-through', text: 'Keep ownership and success criteria clear before work moves into execution.', icon: 'fa-check-double' },
    ],
    shortcuts: [
      { to: '/marketing/analytics', label: 'Open Analytics', icon: 'fa-chart-bar', primary: true },
      { to: '/marketing/content', label: 'Review Content & Banners', icon: 'fa-paint-brush' },
    ],
  },
  {
    path: '/marketing/analytics',
    title: 'Marketing Analytics',
    subtitle: 'Review growth patterns, campaign results, and audience behavior across the platform.',
    icon: 'fa-chart-bar',
    accent: '#F59E0B',
    stats: [
      { label: 'Signal', value: 'Data', note: 'Growth and conversion awareness', icon: 'fa-chart-bar', color: '#F59E0B' },
      { label: 'Goal', value: 'Decisions', note: 'Use evidence over guesses', icon: 'fa-lightbulb', color: '#4CC9A6' },
      { label: 'View', value: 'Funnel', note: 'Acquisition to purchase', icon: 'fa-filter-circle-dollar', color: '#5B7FE5' },
    ],
    details: [
      { title: 'Measure real outcomes', text: 'Use this section for conversion, retention, and campaign response tracking.', icon: 'fa-ruler' },
      { title: 'Spot promising audiences', text: 'Good analytics reveal which users, channels, or creators deserve more investment.', icon: 'fa-search' },
      { title: 'Make spend smarter', text: 'Reliable measurement helps cut low-value promotions early.', icon: 'fa-money-check-dollar' },
    ],
    shortcuts: [
      { to: '/marketing/revenue', label: 'Open Revenue', icon: 'fa-dollar-sign', primary: true },
      { to: '/marketing/insights', label: 'Open Customer Insights', icon: 'fa-users' },
    ],
  },
  {
    path: '/marketing/push',
    title: 'Push & Email',
    subtitle: 'Prepare outreach campaigns, reminder sequences, and customer re-engagement messaging.',
    icon: 'fa-paper-plane',
    accent: '#F59E0B',
    stats: [
      { label: 'Channels', value: 'Outbound', note: 'Email and push communication', icon: 'fa-paper-plane', color: '#F59E0B' },
      { label: 'Goal', value: 'Engage', note: 'Bring users back effectively', icon: 'fa-reply-all', color: '#4CC9A6' },
      { label: 'Voice', value: 'Consistent', note: 'Brand tone matters', icon: 'fa-pen-fancy', color: '#5B7FE5' },
    ],
    details: [
      { title: 'Build timed sequences', text: 'Use this workspace for newsletters, reminders, and onboarding outreach.', icon: 'fa-envelope-open-text' },
      { title: 'Coordinate with platform events', text: 'Messaging works best when it reflects launches, sales, or creator activity on time.', icon: 'fa-link' },
      { title: 'Respect clarity and consent', text: 'Strong outbound communication should stay useful, respectful, and easy to understand.', icon: 'fa-hand-holding-heart' },
    ],
    shortcuts: [
      { to: '/marketing/campaigns', label: 'Back to Campaigns', icon: 'fa-bullseye', primary: true },
      { to: '/marketing/content', label: 'Open Content', icon: 'fa-paint-brush' },
    ],
  },
  {
    path: '/marketing/ads',
    title: 'Advertisements',
    subtitle: 'Track paid promotion ideas, audience targeting, and creative performance.',
    icon: 'fa-ad',
    accent: '#F59E0B',
    stats: [
      { label: 'Focus', value: 'Paid', note: 'Ad channel planning', icon: 'fa-ad', color: '#F59E0B' },
      { label: 'Need', value: 'Efficient', note: 'Spend where return is real', icon: 'fa-coins', color: '#4CC9A6' },
      { label: 'Creative', value: 'Tested', note: 'Message-market fit matters', icon: 'fa-vials', color: '#F06B8D' },
    ],
    details: [
      { title: 'Organize ad hypotheses', text: 'Use this route to compare audiences, copy, and creatives before spending heavily.', icon: 'fa-flask' },
      { title: 'Link spend to outcomes', text: 'Paid work is only useful when tied to signups, purchases, or reactivation goals.', icon: 'fa-arrow-trend-up' },
      { title: 'Keep creative feedback tight', text: 'Fast review cycles improve ad quality and reduce wasted iterations.', icon: 'fa-comments-dollar' },
    ],
    shortcuts: [
      { to: '/marketing/analytics', label: 'Open Analytics', icon: 'fa-chart-bar', primary: true },
      { to: '/marketing/trends', label: 'Review Trends', icon: 'fa-fire' },
    ],
  },
  {
    path: '/marketing/referrals',
    title: 'Referrals',
    subtitle: 'Support word-of-mouth growth with referral planning, offers, and audience incentives.',
    icon: 'fa-gift',
    accent: '#F59E0B',
    stats: [
      { label: 'Loop', value: 'Referral', note: 'Invite and reward growth', icon: 'fa-gift', color: '#F59E0B' },
      { label: 'Trust', value: 'High', note: 'People trust recommendations', icon: 'fa-handshake', color: '#4CC9A6' },
      { label: 'Reach', value: 'Organic', note: 'Amplify community sharing', icon: 'fa-share-nodes', color: '#5B7FE5' },
    ],
    details: [
      { title: 'Shape incentive ideas', text: 'Use this page to plan referral rewards and campaign rules that make sense for the platform.', icon: 'fa-tags' },
      { title: 'Understand who refers', text: 'Top advocates often deserve tailored treatment or creator-specific promotion support.', icon: 'fa-user-plus' },
      { title: 'Measure quality, not just volume', text: 'The best referral programs bring in retained, purchasing users.', icon: 'fa-chart-simple' },
    ],
    shortcuts: [
      { to: '/marketing/insights', label: 'Open Customer Insights', icon: 'fa-users', primary: true },
      { to: '/marketing/revenue', label: 'Review Revenue', icon: 'fa-dollar-sign' },
    ],
  },
  {
    path: '/marketing/revenue',
    title: 'Revenue',
    subtitle: 'Connect marketing work to earnings, campaign return, and platform growth.',
    icon: 'fa-dollar-sign',
    accent: '#F59E0B',
    stats: [
      { label: 'Focus', value: 'Return', note: 'Revenue impact of growth work', icon: 'fa-dollar-sign', color: '#F59E0B' },
      { label: 'Question', value: 'What pays?', note: 'Double down on winning channels', icon: 'fa-magnifying-glass-dollar', color: '#4CC9A6' },
      { label: 'View', value: 'Platform', note: 'Top-line commercial signal', icon: 'fa-building', color: '#5B7FE5' },
    ],
    details: [
      { title: 'Tie activity to outcomes', text: 'Campaigns matter most when they can be linked to meaningful purchase or wallet behavior.', icon: 'fa-link' },
      { title: 'Spot leverage points', text: 'Use revenue analysis to find the audiences and promotions with the strongest upside.', icon: 'fa-crosshairs' },
      { title: 'Improve planning quality', text: 'Commercial visibility helps marketing prioritize the work that genuinely moves the business.', icon: 'fa-chart-pie' },
    ],
    shortcuts: [
      { to: '/marketing/analytics', label: 'Back to Analytics', icon: 'fa-chart-bar', primary: true },
      { to: '/marketing/campaigns', label: 'Open Campaigns', icon: 'fa-bullseye' },
    ],
  },
  {
    path: '/marketing/insights',
    title: 'Customer Insights',
    subtitle: 'Understand what buyers, photographers, and institutions care about most.',
    icon: 'fa-users',
    accent: '#F59E0B',
    stats: [
      { label: 'Focus', value: 'Audience', note: 'Motivation and behavior', icon: 'fa-users', color: '#F59E0B' },
      { label: 'Value', value: 'Sharper', note: 'Better message targeting', icon: 'fa-bullseye', color: '#4CC9A6' },
      { label: 'Source', value: 'Signals', note: 'Usage, campaigns, support, sales', icon: 'fa-wave-square', color: '#5B7FE5' },
    ],
    details: [
      { title: 'Map audience differences', text: 'Buyers, photographers, and institutions often need different positioning and offers.', icon: 'fa-people-arrows' },
      { title: 'Use qualitative clues too', text: 'Support questions and creator feedback can be just as valuable as dashboard charts.', icon: 'fa-comment-alt' },
      { title: 'Strengthen product-language fit', text: 'Insight work helps the team talk about the product in the way users already think.', icon: 'fa-language' },
    ],
    shortcuts: [
      { to: '/marketing/trends', label: 'Review Trends', icon: 'fa-fire', primary: true },
      { to: '/marketing/content', label: 'Open Content', icon: 'fa-paint-brush' },
    ],
  },
  {
    path: '/marketing/trends',
    title: 'Trends',
    subtitle: 'Track what is resonating in the market so content and campaigns stay timely.',
    icon: 'fa-fire',
    accent: '#F59E0B',
    stats: [
      { label: 'Signal', value: 'Momentum', note: 'Spot changing attention early', icon: 'fa-fire', color: '#F59E0B' },
      { label: 'Speed', value: 'Fast', note: 'Act while relevance lasts', icon: 'fa-bolt', color: '#4CC9A6' },
      { label: 'Benefit', value: 'Timely', note: 'Better creative resonance', icon: 'fa-clock', color: '#5B7FE5' },
    ],
    details: [
      { title: 'Track emerging themes', text: 'Use this route to gather ideas from seasons, community behavior, and creator demand.', icon: 'fa-binoculars' },
      { title: 'Turn trends into content', text: 'Fast translation from trend to banner, email, or campaign keeps marketing fresh.', icon: 'fa-arrow-right' },
      { title: 'Stay selective', text: 'Not every trend is worth chasing; keep the brand and audience fit in mind.', icon: 'fa-filter' },
    ],
    shortcuts: [
      { to: '/marketing/campaigns', label: 'Open Campaigns', icon: 'fa-bullseye', primary: true },
      { to: '/marketing/ads', label: 'Review Ads', icon: 'fa-ad' },
    ],
  },
  {
    path: '/marketing/content',
    title: 'Content & Banners',
    subtitle: 'Coordinate visuals, copy, and brand presentation for customer-facing promotions.',
    icon: 'fa-paint-brush',
    accent: '#F59E0B',
    stats: [
      { label: 'Focus', value: 'Creative', note: 'Banners, copy, and assets', icon: 'fa-paint-brush', color: '#F59E0B' },
      { label: 'Need', value: 'Consistent', note: 'Brand clarity across channels', icon: 'fa-swatchbook', color: '#4CC9A6' },
      { label: 'Goal', value: 'Compelling', note: 'Make discovery easier', icon: 'fa-star', color: '#5B7FE5' },
    ],
    details: [
      { title: 'Coordinate visual direction', text: 'Use this page to organize campaign art, homepage banners, and supporting copy needs.', icon: 'fa-images' },
      { title: 'Support reuse', text: 'A content workspace helps the team keep strong creative assets easy to find and adapt.', icon: 'fa-clone' },
      { title: 'Connect message to action', text: 'Good content should make the next click feel obvious and worthwhile.', icon: 'fa-arrow-pointer' },
    ],
    shortcuts: [
      { to: '/marketing/push', label: 'Open Push & Email', icon: 'fa-paper-plane', primary: true },
      { to: '/marketing/profile', label: 'Open Marketing Profile', icon: 'fa-user' },
    ],
  },
  {
    path: '/marketing/profile',
    title: 'Marketing Profile',
    subtitle: 'Give marketing staff a stable identity page and a clean home for future preferences.',
    icon: 'fa-user',
    accent: '#F59E0B',
    stats: [
      { label: 'Role', value: 'Marketing', note: 'Growth and outreach access', icon: 'fa-user-tag', color: '#F59E0B' },
      { label: 'State', value: 'Signed In', note: 'Current account context', icon: 'fa-id-card', color: '#5B7FE5' },
      { label: 'Access', value: 'Scoped', note: 'Marketing routes only', icon: 'fa-lock', color: '#4CC9A6' },
    ],
    details: [
      { title: 'Anchor the marketing workspace', text: 'A dedicated profile route keeps this role from falling into dead-end navigation.', icon: 'fa-compass' },
      { title: 'Prepare for future settings', text: 'This screen is ready for signatures, saved audiences, or communication preferences later.', icon: 'fa-sliders-h' },
      { title: 'Keep role identity obvious', text: 'Stable role-aware routes make onboarding and internal testing much smoother.', icon: 'fa-check-circle' },
    ],
    shortcuts: [
      { to: '/marketing/dashboard', label: 'Back to Dashboard', icon: 'fa-chart-line', primary: true },
      { to: '/marketing/campaigns', label: 'Open Campaigns', icon: 'fa-bullseye' },
    ],
  },
];

function UrlNormalizer() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.includes('//')) {
      const fixed = location.pathname.replace(/\/\/+/g, '/');
      navigate(fixed + location.search + location.hash, { replace: true });
    }
  }, [location.pathname, navigate]);
  return null;
}

function RouteWithBodyClass({ children }) {
  const location = useLocation();

  useEffect(() => {
    const clean = location.pathname.replace(/[:?&=/]+/g, '-').replace(/^-|-$/g, '') || 'home';
    document.body.className = `page-${clean}`;
    return () => {
      document.body.className = '';
    };
  }, [location]);

  return children;
}

function App() {
  return (
    <HelmetProvider>
    <ErrorBoundary>
    <ThemeProvider>
    <ToastContainer />
    <ConfirmDialog />
    <BrowserRouter>
      <UrlNormalizer />
      <OnboardingWizard />
      <ErrorBoundary>
      <RouteWithBodyClass>
        <Routes>
          {/* Public Routes - Landing Page */}
          <Route path='/' element={<HomePage />} />
          <Route path='/explore' element={<Explore />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/auth/google/callback' element={<AuthCallback />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/verify-email' element={<EmailVerification />} />
          
          {/* Admin Routes */}
          <Route path='/admin/dashboard' element={<ProtectedRoute requiredRole="admin"><AdminDash /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute requiredRole="admin"><AdminMedia /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUser /></ProtectedRoute>} />
          <Route path="/admin/photographers" element={<ProtectedRoute requiredRole="admin"><AdminUser /></ProtectedRoute>} />
          <Route path="/admin/transactions" element={<ProtectedRoute requiredRole="admin"><AdminReceipts /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminAudit /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/moderation" element={<ProtectedRoute requiredRole="admin"><AdminModeration /></ProtectedRoute>} />
          <Route path="/admin/shares" element={<ProtectedRoute requiredRole="admin"><AdminShares /></ProtectedRoute>} />
          <Route path="/admin/receipts" element={<ProtectedRoute requiredRole="admin"><AdminReceipts /></ProtectedRoute>} />
          <Route path="/admin/refunds" element={<ProtectedRoute requiredRole="admin"><AdminRefunds /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute requiredRole="admin"><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute requiredRole="admin"><AdminAudit /></ProtectedRoute>} />
          <Route path="/admin/withdrawals" element={<ProtectedRoute requiredRole="admin"><AdminWithdrawals /></ProtectedRoute>} />
          <Route path="/admin/albums" element={<ProtectedRoute requiredRole="admin"><AdminAlbums /></ProtectedRoute>} />
          <Route path="/admin/wallets" element={<ProtectedRoute requiredRole="admin"><AdminWallets /></ProtectedRoute>} />
          <Route path="/admin/portfolios"    element={<ProtectedRoute requiredRole="admin"><AdminPortfolios /></ProtectedRoute>} />
          <Route path="/admin/config"        element={<ProtectedRoute requiredRole="admin"><AdminConfig /></ProtectedRoute>} />
          <Route path="/admin/applications"  element={<ProtectedRoute requiredRole="admin"><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/logs"          element={<ProtectedRoute requiredRole="admin"><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/staff"          element={<ProtectedRoute requiredRole="admin"><AdminStaff /></ProtectedRoute>} />
          <Route path="/admin/notifications"   element={<ProtectedRoute requiredRole="admin"><AdminNotifications /></ProtectedRoute>} />
          <Route path="/admin/media-approval" element={<ProtectedRoute requiredRole="admin"><AdminMediaApproval /></ProtectedRoute>} />

          {/* Staff Role Routes */}
          <Route path='/secretary/dashboard'     element={<ProtectedRoute requiredRole="secretary"><SecretaryDash /></ProtectedRoute>} />
          <Route path='/secretary/notifications' element={<ProtectedRoute requiredRole="secretary"><SecretaryNotifications /></ProtectedRoute>} />
          <Route path='/engineer/dashboard'      element={<ProtectedRoute requiredRole="engineer"><EngineerDash /></ProtectedRoute>} />
          <Route path='/marketing/dashboard'     element={<ProtectedRoute requiredRole="marketing"><MarketingDash /></ProtectedRoute>} />
          {secretaryRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute requiredRole="secretary">
                  <StaffWorkspacePage Layout={SecretaryLayout} {...route} />
                </ProtectedRoute>
              }
            />
          ))}
          {engineerRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute requiredRole="engineer">
                  <StaffWorkspacePage Layout={EngineerLayout} {...route} />
                </ProtectedRoute>
              }
            />
          ))}
          {marketingRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute requiredRole="marketing">
                  <StaffWorkspacePage Layout={MarketingLayout} {...route} />
                </ProtectedRoute>
              }
            />
          ))}

          {/* Photographer Routes */}
          <Route path='/photographer/dashboard' element={<ProtectedRoute requiredRole="photographer"><PhotographerDash /></ProtectedRoute>} />
          <Route path="/photographer/earnings" element={<ProtectedRoute requiredRole="photographer"><PhotographerEarnings /></ProtectedRoute>} />
          <Route path="/photographer/media" element={<ProtectedRoute requiredRole="photographer"><PhotographerMedia /></ProtectedRoute>} />
          <Route path="/photographer/profile" element={<ProtectedRoute requiredRole="photographer"><PhotographerProfile /></ProtectedRoute>} />
          <Route path="/photographer/sales" element={<ProtectedRoute requiredRole="photographer"><PhotographerSales /></ProtectedRoute>} />
          <Route path="/photographer/upload" element={<ProtectedRoute requiredRole="photographer"><PhotographerUpload /></ProtectedRoute>} />
          <Route path="/photographer/withdrawals" element={<ProtectedRoute requiredRole="photographer"><PhotographerWithdrawals /></ProtectedRoute>} />
          <Route path="/photographer/settings" element={<ProtectedRoute requiredRole="photographer"><PhotographerSettings /></ProtectedRoute>} />
          <Route path="/photographer/portfolio" element={<ProtectedRoute requiredRole="photographer"><PhotographerPortfolio /></ProtectedRoute>} />
          <Route path="/photographer/analytics" element={<ProtectedRoute requiredRole="photographer"><SalesAnalytics /></ProtectedRoute>} />
          <Route path="/photographer/referral" element={<ProtectedRoute requiredRole="photographer"><ReferralPage /></ProtectedRoute>} />
          <Route path="/photographer/proofing" element={<ProtectedRoute requiredRole="photographer"><ClientProofing /></ProtectedRoute>} />
          <Route path="/photographer/albums" element={<ProtectedRoute requiredRole="photographer"><MyAlbums /></ProtectedRoute>} />
          <Route path="/photographer/albums/create" element={<ProtectedRoute requiredRole="photographer"><CreateAlbum /></ProtectedRoute>} />
          <Route path="/photographer/albums/:albumId" element={<ProtectedRoute requiredRole="photographer"><AlbumManage /></ProtectedRoute>} />

          {/* Buyer Routes */}
          <Route path="/buyer/cart" element={<ProtectedRoute requiredRole="buyer"><BuyerCart /></ProtectedRoute>} />
          <Route path="/buyer/dashboard" element={<ProtectedRoute requiredRole="buyer"><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/buyer/transactions" element={<ProtectedRoute requiredRole="buyer"><BuyerTransactions /></ProtectedRoute>} />
          <Route path="/buyer/downloads" element={<ProtectedRoute requiredRole="buyer"><BuyerDownloads /></ProtectedRoute>} />
          <Route path="/buyer/favorites" element={<ProtectedRoute requiredRole="buyer"><BuyerFavorites /></ProtectedRoute>} />
          <Route path="/buyer/profile" element={<ProtectedRoute requiredRole="buyer"><BuyerProfile /></ProtectedRoute>} />
          <Route path="/buyer/wallet" element={<ProtectedRoute requiredRole="buyer"><BuyerWallet /></ProtectedRoute>} />
          <Route path="/buyer/explore" element={<ProtectedRoute requiredRole="buyer"><BuyerExplore /></ProtectedRoute>} />
          <Route path="/buyer/referral" element={<ProtectedRoute requiredRole="buyer"><BuyerReferralPage /></ProtectedRoute>} />
          <Route path="/buyer/settings" element={<ProtectedRoute requiredRole="buyer"><BuyerSettings /></ProtectedRoute>} />
          <Route path="/album/:albumId/access/:token" element={<ProtectedRoute requiredRole="buyer"><BuyerAlbumAccess /></ProtectedRoute>} />
          <Route path="/share/:token" element={<ShareAccess />} />

          {/* Proofing */}
          <Route path="/proofing/:token" element={<ClientProofingView />} />

          {/* Public Portfolio */}
          <Route path="/portfolio/:username" element={<PublicPortfolio />} />

          {/* Public Album View */}
          <Route path="/album/:albumId" element={<PublicAlbumView />} />

          {/* Public Gallery (legacy) */}
          <Route path="/gallery/:albumId" element={<PublicGallery />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Routes>
      </RouteWithBodyClass>
      </ErrorBoundary>
    </BrowserRouter>
    </ThemeProvider>
    </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;

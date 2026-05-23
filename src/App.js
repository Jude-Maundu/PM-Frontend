import './App.css';
import './styles/mobileStyles.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from './context/ThemeContext';
import '@fortawesome/fontawesome-free/css/all.min.css'
import ToastContainer from './Components/ToastContainer';
import ConfirmDialog from './Components/ConfirmDialog';

// Public Pages
import Login from './Components/Pages/Login';
import Register from './Components/Pages/Register';
import AuthCallback from './Components/AuthCallback';

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
import ShareAccess from './Components/Pages/Buyer/ShareAccess';

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
import MessagingPage from './Components/Pages/Messaging/MessagingPage';
import BuyerFollowPage from './Components/Pages/Buyer/BuyerFollowPage';
import BuyerReferralPage from './Components/Pages/Buyer/BuyerReferralPage';
import PhotographerFollowPage from './Components/Pages/Photographer/PhotographerFollowPage';
import Explore from './Components/Pages/Explore';
import HomePage from './Components/Pages/HomePage';
import ClientProofing from './Components/Pages/Photographer/ClientProofing';
import ClientProofingView from './Components/Pages/Proofing/ClientProofingView';
import OnboardingWizard from './Components/OnboardingWizard';
import PublicGallery from './Components/Pages/Public/PublicGallery';

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
    <ThemeProvider>
    <ToastContainer />
    <ConfirmDialog />
    <BrowserRouter>
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
          <Route path="/admin/staff"         element={<ProtectedRoute requiredRole="admin"><AdminStaff /></ProtectedRoute>} />
          
          {/* Photographer Routes */}
          <Route path='/photographer/dashboard' element={<ProtectedRoute requiredRole="photographer"><PhotographerDash /></ProtectedRoute>} />
          <Route path="/photographer/earnings" element={<ProtectedRoute requiredRole="photographer"><PhotographerEarnings /></ProtectedRoute>} />
          <Route path="/photographer/media" element={<ProtectedRoute requiredRole="photographer"><PhotographerMedia /></ProtectedRoute>} />
          <Route path="/photographer/profile" element={<ProtectedRoute requiredRole="photographer"><PhotographerProfile /></ProtectedRoute>} />
          <Route path="/photographer/sales" element={<ProtectedRoute requiredRole="photographer"><PhotographerSales /></ProtectedRoute>} />
          <Route path="/photographer/upload" element={<ProtectedRoute requiredRole="photographer"><PhotographerUpload /></ProtectedRoute>} />
          <Route path="/photographer/withdrawals" element={<ProtectedRoute requiredRole="photographer"><PhotographerWithdrawals /></ProtectedRoute>} />
          <Route path="/photographer/follow" element={<ProtectedRoute requiredRole="photographer"><PhotographerFollowPage /></ProtectedRoute>} />
          <Route path="/photographer/settings" element={<ProtectedRoute requiredRole="photographer"><PhotographerSettings /></ProtectedRoute>} />
          <Route path="/photographer/portfolio" element={<ProtectedRoute requiredRole="photographer"><PhotographerPortfolio /></ProtectedRoute>} />
          <Route path="/photographer/analytics" element={<ProtectedRoute requiredRole="photographer"><SalesAnalytics /></ProtectedRoute>} />
          <Route path="/photographer/referral" element={<ProtectedRoute requiredRole="photographer"><ReferralPage /></ProtectedRoute>} />
          <Route path="/photographer/proofing" element={<ProtectedRoute requiredRole="photographer"><ClientProofing /></ProtectedRoute>} />

          {/* Buyer Routes */}
          <Route path="/buyer/cart" element={<ProtectedRoute requiredRole="buyer"><BuyerCart /></ProtectedRoute>} />
          <Route path="/buyer/dashboard" element={<ProtectedRoute requiredRole="buyer"><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/buyer/transactions" element={<ProtectedRoute requiredRole="buyer"><BuyerTransactions /></ProtectedRoute>} />
          <Route path="/buyer/downloads" element={<ProtectedRoute requiredRole="buyer"><BuyerDownloads /></ProtectedRoute>} />
          <Route path="/buyer/favorites" element={<ProtectedRoute requiredRole="buyer"><BuyerFavorites /></ProtectedRoute>} />
          <Route path="/buyer/profile" element={<ProtectedRoute requiredRole="buyer"><BuyerProfile /></ProtectedRoute>} />
          <Route path="/buyer/wallet" element={<ProtectedRoute requiredRole="buyer"><BuyerWallet /></ProtectedRoute>} />
          <Route path="/buyer/explore" element={<ProtectedRoute requiredRole="buyer"><BuyerExplore /></ProtectedRoute>} />
          <Route path="/buyer/follow" element={<ProtectedRoute requiredRole="buyer"><BuyerFollowPage /></ProtectedRoute>} />
          <Route path="/buyer/referral" element={<ProtectedRoute requiredRole="buyer"><BuyerReferralPage /></ProtectedRoute>} />
          <Route path="/buyer/settings" element={<ProtectedRoute requiredRole="buyer"><BuyerSettings /></ProtectedRoute>} />
          <Route path="/buyer/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
          <Route path="/album/:albumId/access/:token" element={<ProtectedRoute requiredRole="buyer"><BuyerAlbumAccess /></ProtectedRoute>} />
          <Route path="/share/:token" element={<ShareAccess />} />

          {/* Proofing */}
          <Route path="/proofing/:token" element={<ClientProofingView />} />

          {/* Public Portfolio */}
          <Route path="/portfolio/:username" element={<PublicPortfolio />} />

          {/* Public Gallery */}
          <Route path="/gallery/:albumId" element={<PublicGallery />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Routes>
      </RouteWithBodyClass>
      </ErrorBoundary>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
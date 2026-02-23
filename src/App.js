import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css'

// Public Pages
import HomePage from './Components/Pages/HomePage';
import Login from './Components/Pages/Login';
import Register from './Components/Pages/Register';

// Admin Pages
import AdminDash from './Components/Pages/Admin/AdminDash';
import AdminMedia from './Components/Pages/Admin/AdminMedia';
import AdminUser from './Components/Pages/Admin/AdminUser';  // Your file is AdminUser.jsx
import AdminReceipts from './Components/Pages/Admin/AdminReceipts';
import AdminRefunds from './Components/Pages/Admin/AdminRefunds';
import AdminSettings from './Components/Pages/Admin/AdminSettings';

// Photographer Pages
import PhotographerDash from './Components/Pages/Photographer/PhotographerDash';
import PhotographerEarnings from './Components/Pages/Photographer/Earnings';
import PhotographerMedia from './Components/Pages/Photographer/MyMedia';
import PhotographerProfile from './Components/Pages/Photographer/Profile';
import PhotographerSales from './Components/Pages/Photographer/SalesHistory';
import PhotographerUpload from './Components/Pages/Photographer/UploadMedia';
import PhotographerWithdrawals from './Components/Pages/Photographer/Withdrawals';

// BuyerPages 
import BuyerCart from './Components/Pages/Buyer/BuyerCart';
import BuyerDashboard from './Components/Pages/Buyer/BuyerDash';
import BuyerTransactions from './Components/Pages/Buyer/BuyerTransaction';
import BuyerDownloads from './Components/Pages/Buyer/BuyerDownloads';
import BuyerFavorites from './Components/Pages/Buyer/BuyerFavourite';
import BuyerProfile from './Components/Pages/Buyer/BuyerProfile';
import BuyerWallet from './Components/Pages/Buyer/BuyerWallet';
import BuyerExplore from './Components/Pages/Buyer/BuyerExplore';





function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        
        {/* Admin Routes */}
        <Route path='/admin/dashboard' element={<AdminDash />} />
        <Route path="/admin/media" element={<AdminMedia />} />
        <Route path="/admin/users" element={<AdminUser />} />
        <Route path="/admin/analytics" element={<AdminDash />} />
        <Route path="/admin/receipts" element={<AdminReceipts />} />
        <Route path="/admin/refunds" element={<AdminRefunds />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        
        {/* Photographer Routes */}
        <Route path='/photographer/dashboard' element={<PhotographerDash />} />
        <Route path="/photographer/earnings" element={<PhotographerEarnings />} />
        <Route path="/photographer/media" element={<PhotographerMedia />} />
        <Route path="/photographer/profile" element={<PhotographerProfile />} />
        <Route path="/photographer/sales" element={<PhotographerSales />} />
        <Route path="/photographer/upload" element={<PhotographerUpload />} />
        <Route path="/photographer/withdrawals" element={<PhotographerWithdrawals />} />
        {/* buyer routes */}
        <Route path="/buyer/cart" element={<BuyerCart />} />
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/transactions" element={<BuyerTransactions />} />
        <Route path="/buyer/downloads" element={<BuyerDownloads />} />
        <Route path="/buyer/favorites" element={<BuyerFavorites />} />
        <Route path="/buyer/profile" element={<BuyerProfile />} />
        <Route path="/buyer/wallet" element={<BuyerWallet />} />
        <Route path="/buyer/explore" element={<BuyerExplore />} />
        
        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Book from "./pages/Book";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import MetroMap from "./pages/MetroMap";
import Wallet from "./pages/Wallet";
import Dashboard from "./pages/Dashboard";
import LostFound from "./pages/LostFound";
import IntentChatWidget from "./components/IntentChatWidget";
import AlertBanner from "./components/AlertBanner";
import SOSButton from "./components/SOSButton";
import MonthlySummary from "./pages/MonthlySummary";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
                <Navbar />
                <SOSButton />
        <AlertBanner />
        <IntentChatWidget />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/book" element={<Book />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/metro-map" element={<MetroMap />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/monthly-summary" element={<MonthlySummary />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
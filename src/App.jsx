import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Modal from "./components/ui/Modal";
import Button from "./components/ui/Button";
import { useAuth } from "./contexts/AuthContext";

// Auth pages
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Main pages
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import ChangePassword from "./pages/ChangePassword";
import Documentation from "./pages/Documentation";
import Notifications from "./pages/Notifications";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import SendEmail from "./pages/SendEmail";
import SupportTickets from "./pages/SupportTickets";
import Transactions from "./pages/Transactions";
import UserManagement from "./pages/DriverRequests";
import ChatSupport from "./pages/ChatSupport";

import "./App.css";
import { Toaster } from "react-hot-toast";
import Categories from "./pages/Categories";
import Configurations from "./pages/Configurations";
import ContentManagement from "./pages/ContentManagement";
import ReportDetail from "./pages/ReportDetail";
import Emergencies from "./pages/Emergencie";
import UserDetailPage from "./pages/UserDetailPage";
import DriverDetails from "./pages/DriverDetails";
import DriverRequests from "./pages/DriverRequests";
import TermCondition from "./pages/TermCondtion";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import VehicleCategoryManagement from "./pages/VehicleCategory";
import RiderDetail from "./pages/RiderDetail";
import DriverDetail from "./pages/DriverDetail";
import SuspendedDrivers from "./pages/SuspendedDrivers";
import RewardedBalanceHistory from "./pages/RewardedBalanceHistory";

import Revenue from "./pages/Revenue";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import PrivateRides from "./pages/PrivateRides";
import RideDetail from "./pages/RideDetail";
import CarpoolRides from "./pages/CarpoolRides";
import CarpoolRideDetail from "./pages/CarpoolRideDetail";
import BirdsEyeView from "./pages/BirdsEyeView";
import RideRates from "./pages/RideRates";
import PeakWindows from "./pages/PeakWindows";
import RideConfiguration from "./pages/RideConfiguration";
import AdminUsers from "./pages/AdminUsers";
import DevHub from "./pages/DevHub";
import { USER_ROLES, SECURITY_CONFIG } from "./config/constants";

const SessionTimeoutModal = () => {
  const { showTimeoutModal, setShowTimeoutModal } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => {
    setShowTimeoutModal(false);
    const redirectUrl = sessionStorage.getItem("autoLogoutRedirectUrl");
    if (redirectUrl && !redirectUrl.startsWith("/auth") && redirectUrl !== "/") {
      navigate(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`, {
        state: { from: redirectUrl, isAutoLogout: true },
        replace: true,
      });
    } else {
      navigate("/auth/login", { replace: true });
    }
  };

  return (
    <Modal
      isOpen={showTimeoutModal}
      onClose={handleClose}
      title="Session Expired"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          Your session has expired due to{" "}
          {SECURITY_CONFIG.sessionTimeout / 60000} minutes of inactivity. Please
          log in again to continue.
        </div>
        <Button
          onClick={handleClose}
          className="w-full"
          variant="primary"
        >
          Login Again
        </Button>
      </div>
    </Modal>
  );
};

function App() {
  return (
    <>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <Router>
              <Routes>
                <Route path="/terms-conditions" element={<TermCondition />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />

                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />

                <Route path="/auth/verify-otp" element={<VerifyOTP />} />

                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />

                <Route path="/d/docs" element={<Documentation />} />

                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to={"/dashboard"} />}
                        />

                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route
                          path="/admin-users"
                          element={
                            <ProtectedRoute requiredRole={USER_ROLES.SUPER_ADMIN}>
                              <AdminUsers />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/change-password"
                          element={
                            <ProtectedRoute requiredRole={USER_ROLES.SUPER_ADMIN}>
                              <ChangePassword />
                            </ProtectedRoute>
                          }
                        />

                        {/* <Route path="/products">
                            <Route path="" element={<Products />} />
                            <Route path="categories" element={<Categories />} />
                          </Route> */}

                        <Route path="/user-management" element={<Users />} />
                        <Route
                          path="/user-management/rider/:id"
                          element={<RiderDetail />}
                        />
                        <Route
                          path="/user-management/driver/:id"
                          element={<DriverDetail />}
                        />
                        <Route
                          path="/vehicle-category"
                          element={
                            <ProtectedRoute requiredPermission="vehicleCategory">
                              <VehicleCategoryManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/orders" element={<Orders />} />
                        <Route
                          path="/driver-requests"
                          element={
                            <ProtectedRoute requiredPermission="viewDriverRequests">
                              <DriverRequests />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/driver/:id"
                          element={
                            <ProtectedRoute requiredPermission="viewDriverRequests">
                              <DriverDetails />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/suspended-drivers"
                          element={
                            <ProtectedRoute requiredPermission="viewDriverRequests">
                              <SuspendedDrivers />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/rewarded-balance-history"
                          element={
                            <ProtectedRoute requiredPermission="viewDriverRequests">
                              <RewardedBalanceHistory />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/content-management"
                          element={<ContentManagement />}
                        />
                        <Route path="/reports" element={<Reports />} />
                        <Route
                          path="/reports-management"
                          element={<SupportTickets />}
                        />
                        <Route
                          path="/revenue"
                          element={
                            <ProtectedRoute requiredPermission="financials">
                              <Revenue />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/campaigns"
                          element={
                            <ProtectedRoute requiredPermission="promos">
                              <Campaigns />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/campaigns/:id"
                          element={
                            <ProtectedRoute requiredPermission="promos">
                              <CampaignDetail />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/ride-rates"
                          element={
                            <ProtectedRoute requiredPermission="financials">
                              <RideRates />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/peak-windows"
                          element={
                            <ProtectedRoute requiredPermission="financials">
                              <PeakWindows />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/ride-configuration"
                          element={
                            <ProtectedRoute requiredPermission="financials">
                              <RideConfiguration />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/private-rides" element={<PrivateRides />} />
                        <Route path="/private-rides/:id" element={<RideDetail />} />
                        <Route path="/carpool-rides" element={<CarpoolRides />} />
                        <Route path="/carpool-rides/:id" element={<CarpoolRideDetail />} />
                        
                        {/* Developer Internal Routes (Direct URL Only) */}
                        <Route path="/dev" element={<DevHub />} />
                        <Route path="/dev/private-rides/:id" element={<RideDetail />} />
                        <Route path="/dev/carpool-rides/:id" element={<CarpoolRideDetail />} />

                        <Route path="/birds-eye-view" element={<BirdsEyeView />} />
                        <Route
                          path="/reports-detail/:id"
                          element={<ReportDetail />}
                        />
                        <Route
                          path="/notifications"
                          element={
                            <ProtectedRoute requiredPermission="sendNotifications">
                              <Notifications />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/history" element={<Emergencies />} />
                        <Route
                          path="/user-detail/:id"
                          element={<UserDetailPage />}
                        />
                        <Route path="/settings">
                          <Route
                            path=""
                            element={
                              <div className="p-6">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                  Settings
                                </h1>
                              </div>
                            }
                          />
                          <Route
                            path="change-password"
                            element={
                              <ProtectedRoute requiredRole={USER_ROLES.SUPER_ADMIN}>
                                <ChangePassword />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="configs" element={<Configurations />} />
                        </Route>

                        <Route path="/docs" element={<Documentation />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                  }
                />
              </Routes>
              <SessionTimeoutModal />
            </Router>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>

      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
}

export default App;

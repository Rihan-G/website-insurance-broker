import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./layouts/AppLayout";
import { RoleGuard } from "./components/RoleGuard";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { UploadPage } from "./pages/UploadPage";
import { ClientsPage } from "./pages/ClientsPage";
import { SettingsPage } from "./pages/SettingsPage";
// Phase 2
import { TwoFactorPage } from "./pages/TwoFactorPage";
import { ReviewPage } from "./pages/ReviewPage";
import { AuditLogPage } from "./pages/AuditLogPage";
// Phase 3
import { InboxPage } from "./pages/InboxPage";
import { PaymentsPage } from "./pages/PaymentsPage";
// Phase 4
import { QuoteCalculatorPage } from "./pages/QuoteCalculatorPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
// Phase 5
import { ExpiryMonitorPage } from "./pages/ExpiryMonitorPage";
import { WhatsAppPage } from "./pages/WhatsAppPage";
import { VoiceUploadPage } from "./pages/VoiceUploadPage";
import { CompliancePage } from "./pages/CompliancePage";
// New pages
import { ServicesPage } from "./pages/ServicesPage";
import { ClientPortalPage } from "./pages/ClientPortalPage";
import { MidTermPage } from "./pages/MidTermPage";
import { CapacityPage } from "./pages/CapacityPage";
import { HolidayCalendarPage } from "./pages/HolidayCalendarPage";
import { CommissionPage } from "./pages/CommissionPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent dark:border-primary-400" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Core */}
        <Route index element={<DashboardPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route
          path="clients"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <ClientsPage />
            </RoleGuard>
          }
        />
        <Route path="settings" element={<SettingsPage />} />

        {/* Phase 2 – Admin & Security */}
        <Route path="2fa" element={<TwoFactorPage />} />
        <Route
          path="review"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <ReviewPage />
            </RoleGuard>
          }
        />
        <Route
          path="audit"
          element={
            <RoleGuard allowedRoles={["admin"]}>
              <AuditLogPage />
            </RoleGuard>
          }
        />

        {/* Phase 3 – Client & Payments */}
        <Route path="inbox" element={<InboxPage />} />
        <Route path="payments" element={<PaymentsPage />} />

        {/* Phase 4 – Advanced */}
        <Route path="quotes" element={<QuoteCalculatorPage />} />
        <Route
          path="analytics"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <AnalyticsPage />
            </RoleGuard>
          }
        />

        {/* Phase 5 – Strategic */}
        <Route path="expiry" element={<ExpiryMonitorPage />} />
        <Route
          path="whatsapp"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <WhatsAppPage />
            </RoleGuard>
          }
        />
        <Route path="voice" element={<VoiceUploadPage />} />
        <Route
          path="compliance"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <CompliancePage />
            </RoleGuard>
          }
        />

        {/* New pages */}
        <Route path="services" element={<ServicesPage />} />
        <Route path="my-policies" element={<ClientPortalPage />} />
        <Route path="mid-term" element={<MidTermPage />} />
        <Route
          path="capacity"
          element={
            <RoleGuard allowedRoles={["admin"]}>
              <CapacityPage />
            </RoleGuard>
          }
        />
        <Route path="calendar" element={<HolidayCalendarPage />} />
        <Route
          path="commissions"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <CommissionPage />
            </RoleGuard>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

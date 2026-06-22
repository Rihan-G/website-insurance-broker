import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./layouts/AppLayout";
import { RoleGuard } from "./components/RoleGuard";
import { PageFallback } from "./components/PageFallback";
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
// Phase 3
import { InboxPage } from "./pages/InboxPage";
import { PaymentsPage } from "./pages/PaymentsPage";
// Phase 4
import { QuoteCalculatorPage } from "./pages/QuoteCalculatorPage";
// Phase 5
import { NotFoundPage } from "./pages/NotFoundPage";
import { AboutPage } from "./pages/marketing/AboutPage";
import { LegalPage } from "./pages/marketing/LegalPage";
import { ProductsIndexPage } from "./pages/marketing/ProductsIndexPage";
import { ProductDetailPage } from "./pages/marketing/ProductDetailPage";
import { ClaimsGuidePage } from "./pages/marketing/ClaimsGuidePage";
import { ComparePage } from "./pages/marketing/ComparePage";
import { ChecklistsPage } from "./pages/marketing/ChecklistsPage";
import { BlogIndexPage } from "./pages/marketing/BlogIndexPage";
import { BlogPostPage } from "./pages/marketing/BlogPostPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CrossPortalNavigate } from "./components/CrossPortalNavigate";
import { getPortalFlavor, staffPortalBaseUrl } from "./lib/portalFlavor";

const LazyReviewPage = lazy(() => import("./pages/ReviewPage").then((m) => ({ default: m.ReviewPage })));
const LazyAuditLogPage = lazy(() => import("./pages/AuditLogPage").then((m) => ({ default: m.AuditLogPage })));
const LazyPerformancePage = lazy(() => import("./pages/PerformancePage").then((m) => ({ default: m.PerformancePage })));
const LazyExpiryMonitorPage = lazy(() => import("./pages/ExpiryMonitorPage").then((m) => ({ default: m.ExpiryMonitorPage })));
const LazyWhatsAppPage = lazy(() => import("./pages/WhatsAppPage").then((m) => ({ default: m.WhatsAppPage })));
const LazyVoiceUploadPage = lazy(() => import("./pages/VoiceUploadPage").then((m) => ({ default: m.VoiceUploadPage })));
const LazyCompliancePage = lazy(() => import("./pages/CompliancePage").then((m) => ({ default: m.CompliancePage })));
const LazyServicesPage = lazy(() => import("./pages/ServicesPage").then((m) => ({ default: m.ServicesPage })));
const LazyClientPortalPage = lazy(() => import("./pages/ClientPortalPage").then((m) => ({ default: m.ClientPortalPage })));
const LazyMidTermPage = lazy(() => import("./pages/MidTermPage").then((m) => ({ default: m.MidTermPage })));
const LazyHolidayCalendarPage = lazy(() => import("./pages/HolidayCalendarPage").then((m) => ({ default: m.HolidayCalendarPage })));
const LazyCommissionPage = lazy(() => import("./pages/CommissionPage").then((m) => ({ default: m.CommissionPage })));
const LazyRenewalsPage = lazy(() => import("./pages/RenewalsPage").then((m) => ({ default: m.RenewalsPage })));
const LazyClaimsIntakePage = lazy(() => import("./pages/ClaimsIntakePage").then((m) => ({ default: m.ClaimsIntakePage })));
const LazySecureMessagesPage = lazy(() => import("./pages/SecureMessagesPage").then((m) => ({ default: m.SecureMessagesPage })));
const LazyNotificationsPage = lazy(() => import("./pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })));
const LazyTasksPage = lazy(() => import("./pages/TasksPage").then((m) => ({ default: m.TasksPage })));
const LazyQuoteLeadsPage = lazy(() => import("./pages/QuoteLeadsPage").then((m) => ({ default: m.QuoteLeadsPage })));
const LazyPrivacyRequestsPage = lazy(() => import("./pages/PrivacyRequestsPage").then((m) => ({ default: m.PrivacyRequestsPage })));
const LazyCoverGapPage = lazy(() => import("./pages/CoverGapPage").then((m) => ({ default: m.CoverGapPage })));
const LazyRenewalPipelinePage = lazy(() => import("./pages/RenewalPipelinePage").then((m) => ({ default: m.RenewalPipelinePage })));
const LazyBulkOutreachPage = lazy(() => import("./pages/BulkOutreachPage").then((m) => ({ default: m.BulkOutreachPage })));
const LazyRateSheetsPage = lazy(() => import("./pages/RateSheetsPage").then((m) => ({ default: m.RateSheetsPage })));
const LazyPolicyCertificatePage = lazy(() => import("./pages/PolicyCertificatePage").then((m) => ({ default: m.PolicyCertificatePage })));
const LazyRenewalRequestPage = lazy(() => import("./pages/RenewalRequestPage").then((m) => ({ default: m.RenewalRequestPage })));
const LazyClaimsTrackerPage = lazy(() => import("./pages/ClaimsTrackerPage").then((m) => ({ default: m.ClaimsTrackerPage })));
const LazyBrokerPerformancePage = lazy(() => import("./pages/BrokerPerformancePage").then((m) => ({ default: m.BrokerPerformancePage })));
const LazyInsurerComparePage = lazy(() => import("./pages/InsurerComparePage").then((m) => ({ default: m.InsurerComparePage })));
const LazyDocRequestsPage = lazy(() => import("./pages/DocRequestsPage").then((m) => ({ default: m.DocRequestsPage })));
const LazyCommissionStatementPage = lazy(() => import("./pages/CommissionStatementPage").then((m) => ({ default: m.CommissionStatementPage })));

function AdminPortalEntry() {
  if (getPortalFlavor() === "client") {
    const staff = staffPortalBaseUrl();
    if (staff) return <CrossPortalNavigate href={`${staff}/admin`} />;
    return <Navigate to="/login" replace />;
  }
  return <AdminLoginPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent dark:border-primary-400" />
      </div>
    );
  }
  return user ? (
    <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
  ) : (
    <Navigate to="/login" />
  );
}

export default function App() {
  return (
    <ErrorBoundary label="Application">
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<LegalPage kind="privacy" />} />
      <Route path="/terms" element={<LegalPage kind="terms" />} />
      <Route path="/products" element={<ProductsIndexPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/claims-guide" element={<ClaimsGuidePage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/checklists" element={<ChecklistsPage />} />
      <Route path="/checklists/:id" element={<ChecklistsPage />} />
      <Route path="/blog" element={<BlogIndexPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminPortalEntry />} />
      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
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
              <Suspense fallback={<PageFallback />}>
                <LazyReviewPage />
              </Suspense>
            </RoleGuard>
          }
        />
        <Route
          path="audit"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyAuditLogPage />
              </Suspense>
            </RoleGuard>
          }
        />

        {/* Phase 3 – Client & Payments */}
        <Route path="inbox" element={<InboxPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route
          path="renewals"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyRenewalsPage />
            </Suspense>
          }
        />
        <Route
          path="claims"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyClaimsIntakePage />
            </Suspense>
          }
        />
        <Route
          path="secure-messages"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazySecureMessagesPage />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyNotificationsPage />
            </Suspense>
          }
        />
        <Route
          path="tasks"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyTasksPage />
              </Suspense>
            </RoleGuard>
          }
        />

        {/* Phase 4 – Advanced */}
        <Route path="quotes" element={<QuoteCalculatorPage />} />
        <Route path="analytics" element={<Navigate to="/dashboard/performance?tab=analytics" replace />} />
        <Route
          path="performance"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyPerformancePage />
            </Suspense>
          }
        />
        <Route
          path="quote-leads"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyQuoteLeadsPage />
              </Suspense>
            </RoleGuard>
          }
        />

        {/* Phase 5 – Strategic */}
        <Route
          path="expiry"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyExpiryMonitorPage />
            </Suspense>
          }
        />
        <Route
          path="whatsapp"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyWhatsAppPage />
              </Suspense>
            </RoleGuard>
          }
        />
        <Route
          path="voice"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyVoiceUploadPage />
            </Suspense>
          }
        />
        <Route
          path="compliance"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyCompliancePage />
              </Suspense>
            </RoleGuard>
          }
        />

        {/* New pages */}
        <Route
          path="services"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyServicesPage />
            </Suspense>
          }
        />
        <Route
          path="my-policies"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyClientPortalPage />
            </Suspense>
          }
        />
        <Route
          path="mid-term"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyMidTermPage />
            </Suspense>
          }
        />
        <Route path="capacity" element={<Navigate to="/dashboard/performance?tab=workload" replace />} />
        <Route
          path="calendar"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyHolidayCalendarPage />
            </Suspense>
          }
        />
        <Route
          path="commissions"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyCommissionPage />
              </Suspense>
            </RoleGuard>
          }
        />
        <Route
          path="privacy-requests"
          element={
            <Suspense fallback={<PageFallback />}>
              <RoleGuard allowedRoles={["admin", "broker"]}>
                <LazyPrivacyRequestsPage />
              </RoleGuard>
            </Suspense>
          }
        />
        {/* New features */}
        <Route
          path="cover-gap"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyCoverGapPage />
            </Suspense>
          }
        />
        <Route
          path="renewal-pipeline"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyRenewalPipelinePage />
              </Suspense>
            </RoleGuard>
          }
        />
        <Route
          path="bulk-outreach"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyBulkOutreachPage />
              </Suspense>
            </RoleGuard>
          }
        />
        <Route
          path="rate-sheets"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyRateSheetsPage />
              </Suspense>
            </RoleGuard>
          }
        />
        <Route
          path="policy-certificate"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyPolicyCertificatePage />
            </Suspense>
          }
        />
        <Route
          path="renewal-request"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyRenewalRequestPage />
            </Suspense>
          }
        />
        <Route
          path="claims-tracker"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyClaimsTrackerPage />
            </Suspense>
          }
        />
        <Route
          path="broker-performance"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyBrokerPerformancePage />
              </Suspense>
            </RoleGuard>
          }
        />
        <Route
          path="insurer-compare"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyInsurerComparePage />
            </Suspense>
          }
        />
        <Route
          path="doc-requests"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyDocRequestsPage />
            </Suspense>
          }
        />
        <Route
          path="commission-statement"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyCommissionStatementPage />
              </Suspense>
            </RoleGuard>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </ErrorBoundary>
  );
}

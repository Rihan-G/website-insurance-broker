import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./layouts/AppLayout";
import { RoleGuard } from "./components/RoleGuard";
import { PageFallback } from "./components/PageFallback";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CrossPortalNavigate } from "./components/CrossPortalNavigate";
import { getPortalFlavor, staffPortalBaseUrl } from "./lib/portalFlavor";

// Marketing pages — lazy loaded
const LazyAboutPage = lazy(() => import("./pages/marketing/AboutPage").then((m) => ({ default: m.AboutPage })));
const LazyLegalPage = lazy(() => import("./pages/marketing/LegalPage").then((m) => ({ default: m.LegalPage })));
const LazyProductsIndexPage = lazy(() => import("./pages/marketing/ProductsIndexPage").then((m) => ({ default: m.ProductsIndexPage })));
const LazyProductDetailPage = lazy(() => import("./pages/marketing/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const LazyClaimsGuidePage = lazy(() => import("./pages/marketing/ClaimsGuidePage").then((m) => ({ default: m.ClaimsGuidePage })));
const LazyComparePage = lazy(() => import("./pages/marketing/ComparePage").then((m) => ({ default: m.ComparePage })));
const LazyChecklistsPage = lazy(() => import("./pages/marketing/ChecklistsPage").then((m) => ({ default: m.ChecklistsPage })));
const LazyBlogIndexPage = lazy(() => import("./pages/marketing/BlogIndexPage").then((m) => ({ default: m.BlogIndexPage })));
const LazyBlogPostPage = lazy(() => import("./pages/marketing/BlogPostPage").then((m) => ({ default: m.BlogPostPage })));

// Dashboard core — lazy loaded
const LazyDashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const LazyDocumentsPage = lazy(() => import("./pages/DocumentsPage").then((m) => ({ default: m.DocumentsPage })));
const LazyUploadPage = lazy(() => import("./pages/UploadPage").then((m) => ({ default: m.UploadPage })));
const LazyClientsPage = lazy(() => import("./pages/ClientsPage").then((m) => ({ default: m.ClientsPage })));
const LazySettingsPage = lazy(() => import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const LazyTwoFactorPage = lazy(() => import("./pages/TwoFactorPage").then((m) => ({ default: m.TwoFactorPage })));
const LazyInboxPage = lazy(() => import("./pages/InboxPage").then((m) => ({ default: m.InboxPage })));
const LazyPaymentsPage = lazy(() => import("./pages/PaymentsPage").then((m) => ({ default: m.PaymentsPage })));
const LazyQuoteCalculatorPage = lazy(() => import("./pages/QuoteCalculatorPage").then((m) => ({ default: m.QuoteCalculatorPage })));
const LazyNotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));
const LazyReferralPage = lazy(() => import("./pages/ReferralPage").then((m) => ({ default: m.ReferralPage })));

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
      <Route path="/about" element={<Suspense fallback={<PageFallback />}><LazyAboutPage /></Suspense>} />
      <Route path="/privacy" element={<Suspense fallback={<PageFallback />}><LazyLegalPage kind="privacy" /></Suspense>} />
      <Route path="/terms" element={<Suspense fallback={<PageFallback />}><LazyLegalPage kind="terms" /></Suspense>} />
      <Route path="/products" element={<Suspense fallback={<PageFallback />}><LazyProductsIndexPage /></Suspense>} />
      <Route path="/products/:slug" element={<Suspense fallback={<PageFallback />}><LazyProductDetailPage /></Suspense>} />
      <Route path="/claims-guide" element={<Suspense fallback={<PageFallback />}><LazyClaimsGuidePage /></Suspense>} />
      <Route path="/compare" element={<Suspense fallback={<PageFallback />}><LazyComparePage /></Suspense>} />
      <Route path="/checklists" element={<Suspense fallback={<PageFallback />}><LazyChecklistsPage /></Suspense>} />
      <Route path="/checklists/:id" element={<Suspense fallback={<PageFallback />}><LazyChecklistsPage /></Suspense>} />
      <Route path="/blog" element={<Suspense fallback={<PageFallback />}><LazyBlogIndexPage /></Suspense>} />
      <Route path="/blog/:slug" element={<Suspense fallback={<PageFallback />}><LazyBlogPostPage /></Suspense>} />
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
        <Route index element={<Suspense fallback={<PageFallback />}><LazyDashboardPage /></Suspense>} />
        <Route path="documents" element={<Suspense fallback={<PageFallback />}><LazyDocumentsPage /></Suspense>} />
        <Route path="upload" element={<Suspense fallback={<PageFallback />}><LazyUploadPage /></Suspense>} />
        <Route
          path="clients"
          element={
            <RoleGuard allowedRoles={["admin", "broker"]}>
              <Suspense fallback={<PageFallback />}>
                <LazyClientsPage />
              </Suspense>
            </RoleGuard>
          }
        />
        <Route path="settings" element={<Suspense fallback={<PageFallback />}><LazySettingsPage /></Suspense>} />

        {/* Phase 2 – Admin & Security */}
        <Route path="2fa" element={<Suspense fallback={<PageFallback />}><LazyTwoFactorPage /></Suspense>} />
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
        <Route path="inbox" element={<Suspense fallback={<PageFallback />}><LazyInboxPage /></Suspense>} />
        <Route path="payments" element={<Suspense fallback={<PageFallback />}><LazyPaymentsPage /></Suspense>} />
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
        <Route path="quotes" element={<Suspense fallback={<PageFallback />}><LazyQuoteCalculatorPage /></Suspense>} />
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
          path="referrals"
          element={
            <Suspense fallback={<PageFallback />}>
              <LazyReferralPage />
            </Suspense>
          }
        />
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
        <Route path="*" element={<Suspense fallback={<PageFallback />}><LazyNotFoundPage /></Suspense>} />
      </Route>
      <Route path="*" element={<Suspense fallback={<PageFallback />}><LazyNotFoundPage /></Suspense>} />
    </Routes>
    </ErrorBoundary>
  );
}

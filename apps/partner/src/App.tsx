import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { initMobileDetection, isMobileSubdomain } from './utils/mobileDetect'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import MobileLayout from './components/layout/MobileLayout'
import AdminLayout from './components/layout/AdminLayout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import BecomePartner from './pages/BecomePartner'
import Pricing from './pages/Pricing'
import Services from './pages/Services'
import ServiceWorkers from './pages/ServiceWorkers'
import ServiceWorkerLogin from './pages/ServiceWorkerLogin'
import ServiceWorkerDashboard from './pages/ServiceWorkerDashboard'
import Camps from './pages/Camps'
import Bookings from './pages/Bookings'
import Earnings from './pages/Earnings'
import Reviews from './pages/Reviews'
import TabbedProfile from './pages/TabbedProfile'
import Availability from './pages/Availability'
import ServiceWizardPage from './pages/ServiceWizardPage'
import ManageServicePage from './pages/ManageServicePage'
import ModernLogin from './pages/auth/ModernLogin'
// OTP-based signup flow
import MobileVerification from './pages/auth/MobileVerification'
import PartnerManagement from './pages/admin/PartnerManagement'
import ServiceManagement from './pages/admin/ServiceManagement'
import AdminPartnerProfile from './pages/admin/AdminPartnerProfile'
import AdminPartnerServices from './pages/admin/AdminPartnerServices'
import AdminBookings from './pages/admin/AdminBookings'
import Revenue from './pages/admin/Revenue'
import AdminReports from './pages/admin/Reports'
import ContentManagement from './pages/admin/ContentManagement'
import JobApplications from './pages/admin/JobApplications'
import Reports from './pages/Reports'
import Providers from './pages/Providers'
import Database from './pages/Database'
import Settings from './pages/Settings'
import HelpCenter from './pages/HelpCenter'
import ContactUs from './pages/ContactUs'
import TrustAndSafety from './pages/TrustAndSafety'
import AboutUs from './pages/AboutUs'
import Careers from './pages/Careers'
import Press from './pages/Press'
import Blog from './pages/Blog'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ChildSafetyGuidelines from './pages/ChildSafetyGuidelines'

const queryClient = new QueryClient()

function App() {
  const [isMobile, setIsMobile] = useState(false);

  // Initialize mobile detection on app load
  // DISABLED: Mobile subdomain redirect disabled - all users stay on partner.kuddl.co
  useEffect(() => {
    // initMobileDetection(); // Commented out to disable redirect
    setIsMobile(false); // Always use desktop layout (which is responsive)
  }, []);

  // Choose layout based on subdomain
  const Layout = isMobile ? MobileLayout : DashboardLayout;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<ModernLogin />} />
                <Route path="/mobile-verification" element={<MobileVerification />} />
                <Route path="/become-partner" element={<BecomePartner />} />
                <Route path="/pricing" element={<Pricing />} />
                {/* Service Worker Portal */}
                <Route path="/worker/login" element={<ServiceWorkerLogin />} />
                <Route path="/worker/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Footer Pages */}
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/trust-safety" element={<TrustAndSafety />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/press" element={<Press />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/child-safety-guidelines" element={<ChildSafetyGuidelines />} />

                {/* Dashboard - Shows admin or partner content based on role */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/onboarding" element={
                  <ProtectedRoute requiredRole="partner">
                    <Layout>
                      <Onboarding />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/services" element={
                  <ProtectedRoute requiredRole="partner" requiresApproval={true}>
                    <Layout>
                      <Services />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/services/create" element={
                  <ProtectedRoute>
                    <Layout>
                      <ServiceWizardPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/camps/create" element={
                  <ProtectedRoute>
                    <Layout>
                      <ServiceWizardPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/manage/:entityType/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <ManageServicePage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/service-workers" element={
                  <ProtectedRoute requiredRole="partner" requiresApproval={true}>
                    <Layout>
                      <ServiceWorkers />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/camps" element={
                  <ProtectedRoute requiredRole="partner" requiresApproval={true}>
                    <Layout>
                      <Camps />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/bookings" element={
                  <ProtectedRoute requiresApproval={true}>
                    <Layout>
                      <Bookings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/earnings" element={
                  <ProtectedRoute requiredRole="partner" requiresApproval={true}>
                    <Layout>
                      <Earnings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/reviews" element={
                  <ProtectedRoute requiresApproval={true}>
                    <Layout>
                      <Reviews />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <TabbedProfile />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/availability" element={
                  <ProtectedRoute requiresApproval={true}>
                    <Layout>
                      <Availability />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute requiresApproval={true}>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/providers" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <Providers />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/database" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <Database />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Admin Protected Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <PartnerManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/services" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <ServiceManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/partner/:partnerId" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminPartnerProfile />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/partners/:partnerId/services" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminPartnerServices />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/bookings" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminBookings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/revenue" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <Revenue />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminReports />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/content" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <ContentManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/job-applications" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <JobApplications />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster position="top-right" />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

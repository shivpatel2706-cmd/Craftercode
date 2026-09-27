import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { PublicVerifyPage } from './pages/public/PublicVerifyPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/auth/LoginPage';

// Applicant Pages
import { ApplicantDashboard } from './pages/applicant/ApplicantDashboard';
import { MyInstrumentsPage } from './pages/applicant/MyInstrumentsPage';
import { RegisterInstrumentPage } from './pages/applicant/RegisterInstrumentPage';
import { ApplicantApplicationsPage } from './pages/applicant/ApplicantApplicationsPage';
import { ApplicationTrackingPage } from './pages/applicant/ApplicationTrackingPage';
import { ApplicantCertificatesPage } from './pages/applicant/ApplicantCertificatesPage';
import { RenewalAlertsPage } from './pages/applicant/RenewalAlertsPage';
import { ApplicantProfilePage } from './pages/applicant/ApplicantProfilePage';

// Officer Pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { AssignedInspectionsPage } from './pages/officer/AssignedInspectionsPage';
import { FieldInspectionPage } from './pages/officer/FieldInspectionPage';
import { InspectionCalendarPage } from './pages/officer/InspectionCalendarPage';
import { CompletedInspectionsPage } from './pages/officer/CompletedInspectionsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DigitalApprovalPage } from './pages/admin/DigitalApprovalPage';
import { ManageApplicationsPage } from './pages/admin/ManageApplicationsPage';
import { ManageOfficersPage } from './pages/admin/ManageOfficersPage';
import { ManageInstrumentsPage } from './pages/admin/ManageInstrumentsPage';
import { ManageCertificatesPage } from './pages/admin/ManageCertificatesPage';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout with Nav & Footer */}
            <Route
              path="/"
              element={
                <div className="min-h-screen flex flex-col justify-between bg-slate-50">
                  <Navbar />
                  <main className="flex-1">
                    <LandingPage />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/how-it-works"
              element={
                <div className="min-h-screen flex flex-col justify-between bg-slate-50">
                  <Navbar />
                  <main className="flex-1">
                    <HowItWorksPage />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/verify"
              element={
                <div className="min-h-screen flex flex-col justify-between bg-slate-50">
                  <Navbar />
                  <main className="flex-1">
                    <PublicVerifyPage />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/verify/:certificateNumber"
              element={
                <div className="min-h-screen flex flex-col justify-between bg-slate-50">
                  <Navbar />
                  <main className="flex-1">
                    <PublicVerifyPage />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/contact"
              element={
                <div className="min-h-screen flex flex-col justify-between bg-slate-50">
                  <Navbar />
                  <main className="flex-1">
                    <ContactPage />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route path="/login" element={<LoginPage />} />

            {/* Applicant Role Routes */}
            <Route path="/applicant" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/applicant/dashboard" replace />} />
              <Route path="dashboard" element={<ApplicantDashboard />} />
              <Route path="instruments" element={<MyInstrumentsPage />} />
              <Route path="register-instrument" element={<RegisterInstrumentPage />} />
              <Route path="applications" element={<ApplicantApplicationsPage />} />
              <Route path="tracking" element={<ApplicationTrackingPage />} />
              <Route path="certificates" element={<ApplicantCertificatesPage />} />
              <Route path="renewal-alerts" element={<RenewalAlertsPage />} />
              <Route path="profile" element={<ApplicantProfilePage />} />
            </Route>

            {/* Officer Role Routes */}
            <Route path="/officer" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/officer/dashboard" replace />} />
              <Route path="dashboard" element={<OfficerDashboard />} />
              <Route path="assigned-inspections" element={<AssignedInspectionsPage />} />
              <Route path="field-inspection" element={<FieldInspectionPage />} />
              <Route path="calendar" element={<InspectionCalendarPage />} />
              <Route path="pending-verification" element={<DigitalApprovalPage />} />
              <Route path="completed-inspections" element={<CompletedInspectionsPage />} />
              <Route path="certificates" element={<ApplicantCertificatesPage />} />
              <Route path="profile" element={<ApplicantProfilePage />} />
            </Route>

            {/* Admin Role Routes */}
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="approvals" element={<DigitalApprovalPage />} />
              <Route path="applications" element={<ManageApplicationsPage />} />
              <Route path="officers" element={<ManageOfficersPage />} />
              <Route path="instruments" element={<ManageInstrumentsPage />} />
              <Route path="certificates" element={<ManageCertificatesPage />} />
              <Route path="users" element={<ManageUsersPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="profile" element={<ApplicantProfilePage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;

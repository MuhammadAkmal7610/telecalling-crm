import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { HealthCheckProvider } from './context/HealthCheckContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import { DialerProvider } from './context/DialerContext';
import CallLoggerWidget from './components/CallLoggerWidget';
import NotificationPermission from './components/NotificationPermission';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import JoinOrganization from './pages/auth/JoinOrganization';
import Home from './pages/Home';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MessageTemplates from './pages/MessageTemplates';
import TeamMemberBlocklist from './pages/TeamMemberBlocklist';
import UserPreferences from './pages/UserPreferences';
import Notifications from './pages/Notifications';
import AllTasks from './pages/AllTasks';
import TransactionHistory from './pages/TransactionHistory';
import Billing from './pages/Billing';
import PermissionTemplates from './pages/PermissionTemplates';
import UsersManagement from './pages/UsersManagement';
import EnterprisePreferences from './pages/EnterprisePreferences';
import CallFeedback from './pages/CallFeedback';
import LeadFields from './pages/LeadFields';
import ManageWorkspaces from './pages/ManageWorkspaces';
import AdminDashboard from './pages/AdminDashboard';

import LeadStage from './pages/LeadStage';
import Integrations from './pages/Integrations';
import ApiTemplates from './pages/ApiTemplates';
import Salesforms from './pages/Salesforms';
import Schedules from './pages/Schedules';
import Workflows from './pages/Workflows';
import AddLead from './pages/AddLead';
import ImportLeads from './pages/ImportLeads';
import Activities from './pages/Activities';
import UnderConstruction from './pages/UnderConstruction';
import WebsiteLeads from './pages/WebsiteLeads';
import FacebookLeads from './pages/FacebookLeads';
import OldLeads from './pages/OldLeads';
import Campaigns from './pages/Campaigns';
import AllLeads from './pages/AllLeads';
import MyLeads from './pages/MyLeads';
import AssignedLeads from './pages/AssignedLeads';
import WhatsAppIntegration from './pages/WhatsAppIntegration';
import UserInvitations from './pages/UserInvitations';
import DailyReport from './pages/DailyReport';
import WhatsappLeads from './pages/WhatsappLeads';
import MyLists from './pages/MyLists';
import Leaderboard from './pages/Leaderboard';
import CallReport from './pages/CallReport';
import ReportDownload from './pages/ReportDownload';
import AllDuplicates from './pages/AllDuplicates';
import Pipeline from './pages/Pipeline';
import Filters from './pages/Filters';
import Reports from './pages/Reports';
import Automations from './pages/Automations';
import CallScripts from './pages/CallScripts';
import DialerSettings from './pages/DialerSettings';
import PublicLeadForm from './pages/PublicLeadForm';
import WhatsApp from './pages/WhatsApp';
import EmailCampaigns from './pages/EmailCampaigns';
import Dialer from './pages/Dialer';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import { Outlet } from 'react-router-dom';


import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <HealthCheckProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/invite/:token" element={<JoinOrganization />} />
                <Route path="/f/:orgName" element={<PublicLeadForm />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={
                    <SocketProvider>
                      <DialerProvider>
                        <Outlet />
                        <CallLoggerWidget />
                        <NotificationPermission />
                      </DialerProvider>
                    </SocketProvider>
                  }>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/add-leads" element={<AddLead />} /> {/* Direct link for sidebar parent item fallback */}
                     <Route path="/activities" element={<Activities />} />
                     <Route path="/whatsapp" element={<WhatsApp />} />
                     <Route path="/whatsapp-integration" element={<WhatsAppIntegration />} />
                    <Route path="/user-invitations" element={<UserInvitations />} />
                    {/* Placeholder Routes redirected to Under Construction */}
                    <Route path="/under-construction" element={<UnderConstruction />} />
                    <Route path="/website-leads" element={<WebsiteLeads />} />
                    <Route path="/facebook-leads" element={<FacebookLeads />} />
                    <Route path="/old-leads" element={<OldLeads />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/email-campaigns" element={<EmailCampaigns />} />
                    <Route path="/all-leads" element={<AllLeads />} />
                    <Route path="/leads" element={<Navigate to="/all-leads" replace />} />
                    <Route path="/my-leads" element={<MyLeads />} />
                    <Route path="/assigned-leads" element={<AssignedLeads />} />
                    <Route path="/daily-report" element={<DailyReport />} />
                    <Route path="/whatsapp-leads" element={<WhatsappLeads />} />
                    <Route path="/filters" element={<Filters />} />
                    <Route path="/my-lists" element={<MyLists />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/call-report" element={<CallReport />} />
                    <Route path="/report-download" element={<ReportDownload />} />
                    <Route path="/all-duplicates" element={<AllDuplicates />} />
                    <Route path="/reports" element={<Reports />} />

                    <Route path="/automations" element={<Automations />} /> {/* Hub page */}

                    <Route path="/profile" element={<Profile />} />
                    <Route path="/templates" element={<MessageTemplates />} />
                    <Route path="/teammember-blocklist" element={<TeamMemberBlocklist />} />
                    <Route path="/my-preferences" element={<UserPreferences />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/all-tasks" element={<AllTasks />} />
                    <Route path="/transaction-history" element={<TransactionHistory />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/permission-templates" element={<PermissionTemplates />} />
                    <Route path="/users" element={<UsersManagement />} />
                    <Route path="/enterprise-preferences" element={<EnterprisePreferences />} />
                    <Route path="/call-feedback" element={<CallFeedback />} />
                    <Route path="/lead-fields" element={<LeadFields />} />
                    <Route path="/manage-workspaces" element={<ManageWorkspaces />} />
                    <Route path="/admin" element={<AdminDashboard />} />

                    <Route path="/lead-stage-configure" element={<LeadStage />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/api-templates" element={<ApiTemplates />} />
                    <Route path="/salesforms" element={<Salesforms />} />
                    <Route path="/schedules" element={<Schedules />} />
                    <Route path="/workflows" element={<Workflows />} />
                    <Route path="/pipeline" element={<Pipeline />} />
                    <Route path="/add-lead" element={<AddLead />} />
                    <Route path="/import-leads" element={<ImportLeads />} />
                    <Route path="/call-scripts" element={<CallScripts />} />
                    <Route path="/dialer" element={<Dialer />} />
                    <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                    <Route path="/dialer-settings" element={<DialerSettings />} />
                  </Route>
                </Route>
              </Routes>
            </Router>
          </HealthCheckProvider>
        </WorkspaceProvider>
      </AuthProvider >
    </ThemeProvider>
  );
}

export default App;
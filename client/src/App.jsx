import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProfileSetup from './pages/Profile/ProfileSetup';
import Dashboard from './pages/Dashboard';
import JobQueue from './pages/JobQueue';
import Applications from './pages/Applications';
import Platforms from './pages/Platforms';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import InterviewPrep from './pages/InterviewPrep';
import Companies from './pages/Companies';
import Settings from './pages/Settings';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><LoadingSpinner text="Loading..." /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Outlet />
      </div>
    </div>
  );
}

function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><LoadingSpinner /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/setup" element={<ProfileSetup />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobQueue />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/platforms" element={<Platforms />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/interviews" element={<InterviewPrep />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background:'var(--bg3)', color:'var(--txt)', border:'1px solid var(--border)', fontSize:'13px' }, success: { iconTheme: { primary:'var(--success)', secondary:'var(--bg3)' } }, error: { iconTheme: { primary:'var(--err)', secondary:'var(--bg3)' } } }} />
    </AuthProvider>
  );
}

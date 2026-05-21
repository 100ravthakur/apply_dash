import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';

// Lazy load pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Resume from './pages/Resume';
import AutoApply from './pages/AutoApply';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Platforms from './pages/Platforms';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import InterviewPrep from './pages/InterviewPrep';
import Companies from './pages/Companies';
import Settings from './pages/Settings';

const Spinner = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
    <div style={{ width: 28, height: 28, border: '2.5px solid var(--border)', borderTop: '2.5px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <div style={{ fontSize: 12, color: 'var(--txt3)' }}>Loading...</div>
  </div>
);

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}

function Public() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<Public />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<Protected />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/auto-apply" element={<AutoApply />} />
            <Route path="/jobs" element={<Jobs />} />
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
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--border2)', fontSize: '13px', fontFamily: 'var(--font)', borderRadius: '8px', boxShadow: 'var(--shadow)' },
          success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg3)' } },
          error: { iconTheme: { primary: 'var(--err)', secondary: 'var(--bg3)' } },
        }}
      />
    </AuthProvider>
  );
}

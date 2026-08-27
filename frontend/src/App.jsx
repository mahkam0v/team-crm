import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Layout } from './components/Layout.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Projects } from './pages/Projects.jsx';
import { ProjectNew } from './pages/ProjectNew.jsx';
import { ProjectDetail } from './pages/ProjectDetail.jsx';
import { Tasks } from './pages/Tasks.jsx';
import { Finance } from './pages/Finance.jsx';
import { Admin } from './pages/Admin.jsx';
import { Profile } from './pages/Profile.jsx';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Yuklanmoqda...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AdminOnly = ({ children }) => {
  const { user } = useAuth();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<Protected><Dashboard /></Protected>} />
    <Route path="/projects" element={<Protected><Projects /></Protected>} />
    <Route path="/projects/new" element={<Protected><ProjectNew /></Protected>} />
    <Route path="/projects/:id" element={<Protected><ProjectDetail /></Protected>} />
    <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
    <Route path="/finance" element={<Protected><Finance /></Protected>} />
    <Route path="/admin" element={<Protected><AdminOnly><Admin /></AdminOnly></Protected>} />
    <Route path="/profile" element={<Protected><Profile /></Protected>} />
  </Routes>
);

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

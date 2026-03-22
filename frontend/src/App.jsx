import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { Box } from '@mui/material';

// Auth Pages
import LoginPage from './pages/Login';
import RegisterCentrePage from './pages/RegisterCentre';
import RequestAccessPage from './pages/RequestAccess';

// Student Pages
import DashboardPage from './pages/Dashboard';
import HistoryPage from './pages/History';
import ExamSessionPage from './pages/ExamSession';
// Auth Pages
import LoginPage from './pages/Login';
import RegisterCentrePage from './pages/RegisterCentre';

// Student Pages
...
// Admin Pages
import GeneratePaperPage from './pages/admin/GeneratePaper';
import SubmissionsPage from './pages/admin/Submissions';
import RegisterUserPage from './pages/admin/RegisterUser';
import CoachingCentresPage from './pages/admin/CoachingCentres';

import { withAuth, withAdmin } from './components/withAuth';

// Wrapped Pages
const ProtectedDashboard = withAuth(DashboardPage);
const ProtectedHistory = withAuth(HistoryPage);
const ProtectedExam = withAuth(ExamSessionPage);
const ProtectedResult = withAuth(ResultViewPage);
const ProtectedMaterials = withAuth(MaterialsPage);
const ProtectedPractice = withAuth(PracticePage);

const AdminGenerate = withAdmin(GeneratePaperPage);
const AdminSubmissions = withAdmin(SubmissionsPage);
const AdminRegister = withAdmin(RegisterUserPage);
const AdminCentres = withAdmin(CoachingCentresPage);
    <>
      <Navbar />
      <Box sx={{ p: { xs: 0, sm: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-centre" element={<RegisterCentrePage />} />
            
            {/* Protected Layout Routes */}
            <Route element={<Layout />}>
              {/* Student Routes */}
              <Route path="dashboard" element={<ProtectedDashboard />} />
              <Route path="history" element={<ProtectedHistory />} />
              <Route path="exam/:sessionId" element={<ProtectedExam />} />
              <Route path="result/:sessionId" element={<ProtectedResult />} />
              <Route path="materials/:examTypeId" element={<ProtectedMaterials />} />
              <Route path="practice/:examTypeId" element={<ProtectedPractice />} />
              
              {/* Admin Routes */}
              <Route path="admin/generate-paper" element={<AdminGenerate />} />
              <Route path="admin/submissions" element={<AdminSubmissions />} />
              <Route path="admin/register" element={<AdminRegister />} />
              <Route path="admin/coaching-centres" element={<AdminCentres />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </AuthProvider>
    </Router>
  );
}

export default App;

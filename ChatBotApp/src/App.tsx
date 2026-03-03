import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SupportLanding } from './pages/SupportLanding';
import { DashboardLayout } from './layouts/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SupportLanding />} />
        <Route path="/app/*" element={<DashboardLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

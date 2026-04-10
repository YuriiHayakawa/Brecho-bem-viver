import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Redireciona raiz para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Placeholder para o dashboard (próxima página) */}
        <Route path="/dashboard" element={<div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Dashboard em construção 🚧</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

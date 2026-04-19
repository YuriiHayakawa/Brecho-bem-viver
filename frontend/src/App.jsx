import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage         from './pages/Login/LoginPage';
import DashboardPage     from './pages/Dashboard/DashboardPage';
import CatalogoPage      from './pages/Catalogo/CatalogoPage';
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage';
import PerfilPage        from './pages/Perfil/PerfilPage';
import OrientacoesPage   from './pages/Orientacoes/OrientacoesPage';
import SobrePage         from './pages/Sobre/SobrePage';

function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/"      element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/catalogo" element={
          <ProtectedRoute><CatalogoPage /></ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute><ProductDetailPage /></ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute><PerfilPage /></ProtectedRoute>
        } />
        <Route path="/orientacoes" element={
          <ProtectedRoute><OrientacoesPage /></ProtectedRoute>
        } />
        <Route path="/sobre" element={
          <ProtectedRoute><SobrePage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

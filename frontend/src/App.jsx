import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout            from './components/Layout/Layout';
import LoginPage         from './pages/Login/LoginPage';
import DashboardPage     from './pages/Dashboard/DashboardPage';
import CatalogoPage      from './pages/Catalogo/CatalogoPage';
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage';
import NovoProdutoPage   from './pages/NovoProduto/NovoProdutoPage';
import EditarProdutoPage from './pages/EditarProduto/EditarProdutoPage';
import MeusProdutosPage  from './pages/MeusProdutos/MeusProdutosPage';
import PerfilPage        from './pages/Perfil/PerfilPage';
import OrientacoesPage      from './pages/Orientacoes/OrientacoesPage';
import SobrePage            from './pages/Sobre/SobrePage';
import GestaoUsuariosPage   from './pages/GestaoUsuarios/GestaoUsuariosPage';

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/"      element={<Navigate to="/catalogo" replace />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/catalogo" element={
          <ProtectedRoute><CatalogoPage /></ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute><ProductDetailPage /></ProtectedRoute>
        } />
        <Route path="/novo-produto" element={
          <ProtectedRoute><NovoProdutoPage /></ProtectedRoute>
        } />
        <Route path="/editar-produto/:id" element={
          <ProtectedRoute><EditarProdutoPage /></ProtectedRoute>
        } />
        <Route path="/meus-produtos" element={
          <ProtectedRoute><MeusProdutosPage /></ProtectedRoute>
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
        <Route path="/gestao-usuarios" element={
          <ProtectedRoute><GestaoUsuariosPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

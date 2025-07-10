import React from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { CustomerDashboard } from './components/CustomerDashboard';
import { OperatorDashboard } from './components/OperatorDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';

function App() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={login} />;
  }

  switch (user.role) {
    case 'customer':
      return <CustomerDashboard user={user} onLogout={logout} />;
    case 'operator':
      return <OperatorDashboard user={user} onLogout={logout} />;
    case 'manager':
      return <ManagerDashboard user={user} onLogout={logout} />;
    default:
      return <AuthForm onLogin={login} />;
  }
}

export default App;
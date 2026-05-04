'use client';
import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import PriceListPage from '@/components/PriceListPage';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Intentar recuperar la sesión de localStorage al cargar
    const savedUser = localStorage.getItem('priceListUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error al parsear usuario guardado');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('priceListUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('priceListUser');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <PriceListPage user={user} onLogout={handleLogout} />;
}

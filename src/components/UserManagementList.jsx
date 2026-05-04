'use client';
import React, { useState, useEffect, useCallback } from 'react';

export default function UserManagementList({ adminUsername }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/users?adminUsername=${adminUsername}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [adminUsername]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateParameter = async (targetUsername, currentAccess, currentPercentage, newPercentage = null) => {
    try {
      const response = await fetch('/api/admin/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUsername,
          targetUsername,
          canSeePrices: currentAccess,
          percentage: newPercentage !== null ? newPercentage : currentPercentage
        }),
      });
      if (response.ok) {
        fetchUsers();
      } else {
        alert('Error al actualizar parámetros');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  if (isLoading) return <p className="text-gray-500 italic">Cargando usuarios...</p>;
  if (error) return <p className="text-red-500 italic">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center sm:text-left">Gestionar Acceso y Porcentajes</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ver Precios</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ajuste (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.username}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.username}</td>
                <td className="px-4 py-3 text-sm text-gray-500 uppercase">{u.role}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => updateParameter(u.username, !u.canSeePrices, u.percentage)}
                    disabled={u.role === 'admin'}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${u.canSeePrices
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                      } ${u.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {u.canSeePrices ? 'Activado' : 'Desactivado'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    value={u.percentage || 0}
                    onChange={(e) => updateParameter(u.username, u.canSeePrices, u.percentage, e.target.value)}
                    className="w-16 text-center border border-gray-300 rounded p-1 text-sm"
                    disabled={u.role === 'admin'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

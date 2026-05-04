'use client';
import React, { useState, useEffect, useCallback } from 'react';

export default function AdminSettings({ adminUsername }) {
  const [settings, setSettings] = useState({ usd_billete: 0, usd_divisa: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/settings?adminUsername=${adminUsername}`);
      const data = await response.json();
      if (response.ok) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminUsername]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUsername, ...settings }),
      });
      if (response.ok) {
        setMessage('Configuración guardada. Recuerda actualizar los precios.');
      }
    } catch (err) {
      setMessage('Error al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Tasas de Cambio (Dólar)</h3>
      <form onSubmit={handleSave} className="space-y-4">
        {message && <p className="text-sm text-blue-600 font-medium">{message}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Dólar Billete (Moneda 2)</label>
            <input
              type="number"
              value={settings.usd_billete}
              onChange={e => setSettings({ ...settings, usd_billete: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dólar Divisa (Moneda 3)</label>
            <input
              type="number"
              value={settings.usd_divisa}
              onChange={e => setSettings({ ...settings, usd_divisa: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-bold disabled:bg-blue-300"
        >
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </form>
    </div>
  );
}

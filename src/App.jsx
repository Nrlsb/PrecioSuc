import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

// --- Iconos ---
const SearchIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const LoaderIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`animate-spin ${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const PlusCircleIcon = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const CheckIcon = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ShoppingCartIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const Trash2Icon = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const XIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlusIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MicIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
// --- Constantes de Configuración ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// --- Componente de Login ---
// --- Componente de Login ---
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Error en la operación');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">Ingresa tus credenciales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu nombre de usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Componente de Creación de Usuarios (Solo Admin) ---
function UserRegistration({ adminUsername }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [percentage, setPercentage] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, adminUsername, percentage }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Usuario creado con éxito');
        setUsername('');
        setPassword('');
        setRole('user');
        setPercentage(0);
      } else {
        setError(data.message || 'Error al crear usuario');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Registrar Nuevo Usuario</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700">Usuario</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Porcentaje de Ajuste (%)</label>
          <input type="number" value={percentage} onChange={e => setPercentage(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: 10" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-bold">Crear Usuario</button>
      </form>
    </div>
  );
}

// --- Componente de Gestión de Usuarios (NUEVO) ---
function UserManagementList({ adminUsername }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users?adminUsername=${adminUsername}`);
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
      const response = await fetch(`${API_URL}/api/admin/update-access`, {
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

// --- Fin Iconos ---


// Helper: Formateador de Moneda
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return '$0.00';
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// --- Helper: Función para normalizar y quitar acentos (NUEVO) ---
const normalizeText = (text) => {
  if (!text) return '';
  // 1. Normaliza la cadena a su forma de descomposición (NFD) para separar los acentos.
  // 2. Elimina los caracteres diacríticos (acentos, tildes, etc.) usando una expresión regular.
  // 3. Convierte a minúsculas.
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// --- Constantes ---
const ITEMS_PER_PAGE = 50;

// --- Componente de Carrito ---
function CartList({ cartItems, onRemoveItem, onUpdateQuantity, onClearCart, onIncrement, onDecrement, userPercentage }) {
  const [editingQuantity, setEditingQuantity] = useState({});

  // Calcula el total
  const total = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Función local para manejar el cambio en el input
  const handleQuantityChange = useCallback((code, value) => {
    // Actualiza el estado local para que el input refleje lo que escribe el usuario,
    // incluyendo el estado temporal de cadena vacía o '0'.
    setEditingQuantity(prev => ({ ...prev, [code]: value }));

    // Si el campo no está vacío, llama a la función de actualización principal
    if (value.trim() !== '') {
      onUpdateQuantity(code, value);
    }
  }, [onUpdateQuantity]);

  // Función local para restablecer el estado temporal al perder el foco
  const handleBlur = useCallback((code, quantity) => {
    // Si el campo quedó vacío (cadena vacía) o es inválido,
    // usamos la cantidad actual del item para forzar un re-render
    if (editingQuantity[code] === '' || isNaN(parseInt(editingQuantity[code], 10))) {
      // Llama a la función de actualización con 0 si el campo estaba vacío/inválido.
      const valueToUse = 0;
      onUpdateQuantity(code, valueToUse);
    }

    // Limpia el estado local para que el input vuelva a usar item.quantity
    setEditingQuantity(prev => {
      const newState = { ...prev };
      delete newState[code];
      return newState;
    });
  }, [editingQuantity, onUpdateQuantity]);

  if (cartItems.length === 0) {
    return null; // No mostrar nada si el carrito está vacío
  }

  return (
    // <!-- MODIFICADO: Se cambió bg-blue-50 por bg-blue-100 y el borde a juego -->
    <div className="mb-6 bg-blue-100 rounded-lg shadow-md border border-blue-300">
      {/* (MODIFICADO) Header con padding responsivo y título más chico en móvil */}
      <header className="flex items-center justify-between p-3 sm:p-4 border-b border-blue-300">
        <div className="flex items-center gap-3">
          <ShoppingCartIcon className="text-blue-600" />
          {/* (MODIFICADO) Título responsivo */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Productos Seleccionados
          </h2>
        </div>
        <button
          onClick={onClearCart}
          className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
        >
          <XIcon size={14} />
          {/* (MODIFICADO) Texto oculto en móvil, visible en escritorio */}
          <span className="hidden sm:inline">Vaciar Lista</span>
        </button>
      </header>

      {/* (NUEVO) Vista de Tarjetas para Móvil */}
      <div className="sm:hidden divide-y divide-blue-300">
        {cartItems.map(item => (
          <div key={item.code} className="p-3">
            <div className="flex justify-between items-start">
              {/* Info del Producto */}
              <div className="flex-1 pr-2">
                <p className="font-semibold text-gray-800">{item.description}</p>
                <p className="text-sm text-gray-500">Código: {item.code}</p>
              </div>
              {/* Botón de Quitar */}
              <button
                onClick={() => onRemoveItem(item.code)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Quitar producto"
              >
                <Trash2Icon size={16} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-3">
              {/* Controlador de Cantidad */}
              <div className="flex items-center">
                <button
                  onClick={() => onDecrement(item.code)}
                  className="p-1.5 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                  title="Restar uno"
                >
                  <MinusIcon size={14} />
                </button>
                <input
                  type="number"
                  min="0"
                  // Usa el valor temporal o el valor real del carrito
                  value={editingQuantity[item.code] !== undefined ? editingQuantity[item.code] : item.quantity}
                  onChange={(e) => handleQuantityChange(item.code, e.target.value)}
                  onBlur={() => handleBlur(item.code, item.quantity)}
                  className="w-12 text-center border-t border-b border-gray-300 py-1 px-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => onIncrement(item.code)}
                  className="p-1.5 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                  title="Sumar uno"
                >
                  <PlusIcon size={14} />
                </button>
              </div>
              {/* Subtotal */}
              <p className="font-semibold text-gray-900 text-right">
                {formatCurrency(item.price * (1 + (userPercentage / 100)) * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* (MODIFICADO) Vista de Tabla para Escritorio (oculta en móvil) */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full">
          {/* <!-- MODIFICADO: Se quitó bg-gray-50 para que herede el bg-blue-100 del contenedor --> */}
          <thead>
            <tr className="border-b border-blue-300">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cant.
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quitar
              </th>
            </tr>
          </thead>
          {/* <!-- MODIFICADO: Se quitó bg-white para que herede el bg-blue-100 y se cambió el borde --> */}
          <tbody className="divide-y divide-blue-200">
            {cartItems.map(item => (
              <tr key={item.code}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.code}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {item.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => onDecrement(item.code)}
                      className="p-1.5 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                      title="Restar uno"
                    >
                      <MinusIcon size={14} />
                    </button>
                    <input
                      type="number"
                      min="0" // Permite cero
                      // Usa el valor temporal o el valor real del carrito
                      value={editingQuantity[item.code] !== undefined ? editingQuantity[item.code] : item.quantity}
                      onChange={(e) => handleQuantityChange(item.code, e.target.value)}
                      onBlur={() => handleBlur(item.code, item.quantity)}
                      className="w-14 text-center border-t border-b border-gray-300 py-1 px-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => onIncrement(item.code)}
                      className="p-1.5 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                      title="Sumar uno"
                    >
                      <PlusIcon size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                  {formatCurrency(item.price * (1 + (userPercentage / 100)) * item.quantity)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => onRemoveItem(item.code)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Quitar producto"
                  >
                    <Trash2Icon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <!-- MODIFICADO: Se quitó bg-gray-50 para que herede el bg-blue-100 y se cambió el borde --> */}
      <footer className="p-3 sm:p-4 border-t border-blue-300 flex justify-end items-center">
        <span className="text-sm font-medium text-gray-700 uppercase mr-4">Total</span>
        <span className="text-xl font-bold text-gray-900">{formatCurrency(cartItems.reduce((acc, item) => acc + (item.price * (1 + (userPercentage / 100)) * item.quantity), 0))}</span>
      </footer>
    </div>
  );
}


// --- Componente de Página (Refactorizado) ---

function PriceListPage({ user, onLogout }) {
  // --- Redirección si no tiene permiso ---
  if (!user.canSeePrices && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Tu cuenta no tiene permiso para ver la lista de precios. Por favor, contacta a un administrador.</p>
          <button
            onClick={onLogout}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-bold"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // --- Estados ---
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false); // NUEVO
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isListening, setIsListening] = useState(false); // NUEVO: Estado para el micrófono
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('priceListCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error al cargar el carrito de localStorage", error);
      return [];
    }
  });

  const { ref, inView } = useInView();

  // --- Lógica de Reconocimiento de Voz (NUEVO) ---
  const handleVoiceSearch = () => {
    // Verifica si la API de reconocimiento de voz está disponible
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Reconocimiento de voz no soportado en este navegador.');
      // En lugar de alert, es mejor una notificación menos intrusiva, pero mantenemos por simplicidad.
      alert('Tu navegador no soporta la búsqueda por voz.');
      return;
    }

    // Si ya está escuchando, detiene la escucha para evitar problemas
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR'; // Establece el idioma a español (Argentina)
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Escuchando...');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voz reconocida:', transcript);
      setSearchTerm(transcript); // Aplica la transcripción al campo de búsqueda
    };

    recognition.onerror = (event) => {
      console.error('Error en el reconocimiento de voz:', event.error);
      if (event.error !== 'no-speech') {
        alert(`Error de voz: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Reconocimiento de voz finalizado.');
      setIsListening(false);
    };

    recognition.start();
  };

  // --- Lógica de Actualización de Precios (NUEVO) ---
  const handleUpdatePrices = async () => {
    if (!window.confirm('¿Seguro que deseas actualizar los precios desde el archivo Excel?')) return;

    setIsUpdatingPrices(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/update-prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUsername: user.username }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`¡Éxito! Se actualizaron ${data.count} productos.`);
        // Recargar productos
        loadProducts();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      alert('Error de conexión al servidor.');
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/products?adminUsername=${user.username}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al cargar los productos`);
        }
        return response.json();
      })
      .then(data => {
        setAllProducts(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err);
        setIsLoading(false);
      });
  }, [user.username]);

  // --- Carga de Datos y Guardado en LocalStorage ---
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    try {
      localStorage.setItem('priceListCart', JSON.stringify(cart));
    } catch (error) {
      console.error("Error al guardar el carrito en localStorage", error);
    }
  }, [cart]);

  // --- Lógica del Carrito (Sin cambios funcionales en esta sección) ---
  const cartItemCodes = useMemo(() => new Set(cart.map(item => item.code)), [cart]);

  const handleAddToCart = (productToAdd) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.code === productToAdd.code);
      if (existingItem) {
        // Si ya existe, incrementamos la cantidad, asegurando que sea al menos 1 si estaba en 0
        return prevCart.map(item =>
          item.code === productToAdd.code
            ? { ...item, quantity: Math.max(1, item.quantity + 1) } // Asegura al menos 1
            : item
        );
      } else {
        return [...prevCart, { ...productToAdd, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productCode, newQuantityStr) => {
    // Si la cadena está vacía (el usuario borró el número) o es NaN,
    // permitimos que el input mantenga el campo vacío/inválido.
    if (newQuantityStr.trim() === '' || isNaN(parseInt(newQuantityStr, 10))) {
      // La lógica de actualización la maneja handleBlur al perder el foco
      return;
    }

    const newQuantity = parseInt(newQuantityStr, 10);

    // Si la cantidad es negativa, la forzamos a 0. No eliminamos el producto.
    const finalQuantity = Math.max(0, newQuantity);

    setCart(prevCart =>
      prevCart.map(item =>
        item.code === productCode ? { ...item, quantity: finalQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productCode) => {
    setCart(prevCart => prevCart.filter(item => item.code !== productCode));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleIncrementQuantity = (productCode) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.code === productCode
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleDecrementQuantity = (productCode) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.code === productCode);
      if (existingItem && existingItem.quantity > 0) {
        return prevCart.map(item =>
          item.code === productCode
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      // Si ya está en 0, no hacemos nada, solo se elimina con el botón de papelera.
      return prevCart;
    });
  };

  // --- Lógica de Filtros (MODIFICADA para usar normalizeText) ---
  const filteredProducts = useMemo(() => {
    let products = allProducts;
    if (searchTerm) {
      // Normaliza el término de búsqueda para ignorar acentos
      const normalizedSearchTerm = normalizeText(searchTerm);

      const searchWords = normalizedSearchTerm
        .split(' ')
        .filter(word => word.length > 0);

      products = products.filter(p => {
        // Normaliza el texto del producto para compararlo
        const productText = normalizeText(
          (p.description || '') + ' ' + (p.code || '')
        );
        return searchWords.every(word => productText.includes(word));
      });
    }
    return products;
  }, [allProducts, searchTerm]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm]);

  useEffect(() => {
    if (inView) {
      setVisibleCount(prevCount =>
        Math.min(prevCount + ITEMS_PER_PAGE, filteredProducts.length)
      );
    }
  }, [inView, filteredProducts.length]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const totalProductsFound = filteredProducts.length;
  const hasMore = visibleCount < totalProductsFound;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // --- Renderizado ---

  return (
    // (MODIFICADO) Padding responsivo
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* (MODIFICADO) Título responsivo */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Lista de Precios</h1>
          <p className="text-gray-600 mt-1">
            Explora nuestro catálogo completo de productos.
            {!isLoading && !error && (
              <span className="ml-2 font-medium text-blue-600">
                ({totalProductsFound} {totalProductsFound === 1 ? 'producto' : 'productos'} encontrados)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-full shadow-sm border border-gray-200 self-start sm:self-auto">
          <span className="text-sm font-medium text-gray-700">Hola, <span className="font-bold">{user.username}</span></span>
          <button
            onClick={handleUpdatePrices}
            disabled={isUpdatingPrices}
            className={`text-xs px-3 py-1 rounded-full transition-colors font-semibold ${isUpdatingPrices ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
          >
            {isUpdatingPrices ? 'Actualizando...' : 'Actualizar Precios'}
          </button>
          <button
            onClick={onLogout}
            className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 transition-colors font-semibold"
          >
            Salir
          </button>
        </div>
      </header>

      {/* --- Barra de Filtros (CORREGIDA) --- */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 1. Contenedor del item de la grilla (sin 'relative') */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por Código o Nombre
          </label>
          {/* 2. Div 'relative' que envuelve SOLO el input y los íconos */}
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Ej: 10001, Z10, Latex..."
              // Ajuste en padding para evitar solapamiento
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {/* 3. Icono de Lupa (ahora centrado correctamente) */}
            <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

            {/* 4. Botón de Búsqueda por Voz (ahora centrado correctamente) */}
            <button
              onClick={handleVoiceSearch}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${isListening
                ? 'text-red-500 hover:text-red-600 animate-pulse'
                : 'text-gray-500 hover:text-blue-600'
                }`}
              title={isListening ? "Escuchando..." : "Buscar por voz"}
            >
              {isListening ? (
                <LoaderIcon size={20} className="text-red-500" />
              ) : (
                <MicIcon size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* --- Fin Barra de Filtros (CORREGIDA) --- */}


      {/* Seccion Admin para crear usuarios */}
      {user.role === 'admin' && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UserRegistration adminUsername={user.username} />
          <UserManagementList adminUsername={user.username} />
        </div>
      )}

      {/* --- Lista/Carrito de Productos Seleccionados (Sin cambios) --- ListList... */}
      <CartList
        cartItems={cart}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onIncrement={handleIncrementQuantity}
        onDecrement={handleDecrementQuantity}
        userPercentage={user.percentage}
      />

      {/* --- Título de la tabla de productos (MODIFICADO) --- */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
        Catálogo de Productos
      </h2>

      {/* (MODIFICADO) Lógica de estados movida fuera de la tabla */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <div className="flex justify-center items-center text-gray-500">
            <LoaderIcon size={24} className="mr-2" />
            Cargando productos...
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-red-200 text-red-600">
          Error al cargar los productos: {error.message}.
          <br />
          <span className="text-sm text-gray-600">¿Ejecutaste 'node convert.mjs' y 'products.json' está en 'public'?</span>
        </div>
      ) : totalProductsFound === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200 text-gray-500">
          No se encontraron productos que coincidan con los filtros.
        </div>
      ) : (
        // (NUEVO) Contenedor para ambas vistas de lista
        <div>
          {/* (NUEVO) Vista de Tarjetas para Móvil */}
          <div className="sm:hidden">
            {visibleProducts.map((product) => {
              const isInCart = cartItemCodes.has(product.code);
              return (
                <div key={product.id} className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-3">
                  <div className="mb-2">
                    <p className="font-semibold text-gray-800">{product.description}</p>
                    <p className="text-sm text-gray-500">Código: {product.code}</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-3">
                    {formatCurrency(product.price * (1 + (user.percentage / 100)))}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isInCart}
                    className={`w-full py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-colors text-sm font-bold ${isInCart
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                  >
                    {isInCart ? (
                      <CheckIcon size={16} />
                    ) : (
                      <PlusCircleIcon size={16} />
                    )}
                    {isInCart ? 'Agregado' : 'Agregar'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* (MODIFICADO) Vista de Tabla para Escritorio (oculta en móvil) */}
          <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200 hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio (ARS)
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleProducts.map((product) => {
                  const isInCart = cartItemCodes.has(product.code);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.code}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {product.description}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(product.price * (1 + (user.percentage / 100)))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isInCart}
                          className={`py-1 px-2.5 rounded-full flex items-center justify-center gap-1.5 transition-colors text-xs font-bold ${isInCart
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                        >
                          {isInCart ? (
                            <CheckIcon size={14} />
                          ) : (
                            <PlusCircleIcon size={14} />
                          )}
                          {isInCart ? 'Agregado' : 'Agregar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* --- Trigger de Carga (visible en ambas vistas) --- */}
          <div ref={ref} className="h-20 flex justify-center items-center">
            {hasMore ? (
              <div className="flex justify-center items-center text-sm text-gray-500">
                <LoaderIcon size={20} className="mr-2" />
                Cargando más...
              </div>
            ) : (
              <span className="text-sm text-gray-500">Fin de la lista</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// --- Componente Raíz (App) ---
export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('priceListUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('priceListUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('priceListUser');
  };

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <PriceListPage user={user} onLogout={handleLogout} />
      )}
    </main>
  );
}
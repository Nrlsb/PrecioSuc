'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { SearchIcon, LoaderIcon, MicIcon, PlusCircleIcon, CheckIcon, XIcon } from './Icons';
import CartList from './CartList';
import UserRegistration from './UserRegistration';
import UserManagementList from './UserManagementList';
import AdminSettings from './AdminSettings';

const ITEMS_PER_PAGE = 50;

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const normalizeText = (text) => {
  if (!text) return '';
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function PriceListPage({ user, onLogout }) {
  if (!user.canSeePrices && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Tu cuenta no tiene permiso para ver la lista de precios. Por favor, contacta a un administrador.</p>
          <button onClick={onLogout} className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-bold">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isListening, setIsListening] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('priceListCart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('priceListCart', JSON.stringify(cart));
  }, [cart]);

  const { ref, inView } = useInView();

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    fetch(`/api/products?adminUsername=${user.username}`)
      .then(res => res.json())
      .then(data => {
        setAllProducts(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [user.username]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (inView) {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    }
  }, [inView]);

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta la búsqueda por voz.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => setSearchTerm(e.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleUpdatePrices = async () => {
    if (!window.confirm('¿Seguro que deseas actualizar los precios desde el archivo Excel?')) return;
    setIsUpdatingPrices(true);
    try {
      const res = await fetch('/api/admin/update-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUsername: user.username }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`¡Éxito! Se actualizaron ${data.count} productos.`);
        loadProducts();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = normalizeText(searchTerm);
    if (!term) return allProducts;
    return allProducts.filter(p =>
      normalizeText(p.code).includes(term) ||
      normalizeText(p.description).includes(term)
    );
  }, [allProducts, searchTerm]);

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.code === product.code);
      if (existing) {
        return prev.map(item => item.code === product.code ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (code) => setCart(prev => prev.filter(item => item.code !== code));
  const updateCartQuantity = (code, qty) => {
    const n = parseInt(qty, 10);
    setCart(prev => prev.map(item => item.code === code ? { ...item, quantity: isNaN(n) ? 0 : n } : item));
  };
  const incrementCart = (code) => setCart(prev => prev.map(item => item.code === code ? { ...item, quantity: item.quantity + 1 } : item));
  const decrementCart = (code) => setCart(prev => prev.map(item => item.code === code ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item));
  const clearCart = () => { if (window.confirm('¿Vaciar lista?')) setCart([]); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">PrecioSuc</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 uppercase font-bold">Usuario</p>
              <p className="text-sm font-semibold text-gray-900">{user.username}</p>
            </div>
            <button onClick={onLogout} className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-full transition-colors border border-red-100">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {user.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <AdminSettings adminUsername={user.username} />
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Actualizar Catálogo</h3>
                <button
                  onClick={handleUpdatePrices}
                  disabled={isUpdatingPrices}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors font-bold disabled:bg-green-300"
                >
                  {isUpdatingPrices ? <LoaderIcon className="animate-spin" /> : 'Actualizar Precios desde Excel'}
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <UserRegistration adminUsername={user.username} />
              <UserManagementList adminUsername={user.username} />
            </div>
          </div>
        )}

        <CartList
          cartItems={cart}
          onRemoveItem={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          onClearCart={clearCart}
          onIncrement={incrementCart}
          onDecrement={decrementCart}
          userPercentage={user.percentage}
        />

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-24 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg shadow-sm"
                placeholder="Buscar por descripción o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                <button
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-100 text-gray-500'}`}
                  title="Búsqueda por voz"
                >
                  <MicIcon />
                </button>
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <XIcon />
                </button>
              </div>
            </div>
            {searchTerm && (
              <p className="text-center mt-3 text-sm text-gray-500">
                Se encontraron <span className="font-bold text-blue-600">{filteredProducts.length}</span> productos
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Info</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <LoaderIcon size={40} className="text-blue-500" />
                        <p className="text-gray-500 animate-pulse">Cargando catálogo...</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleProducts.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500 italic">
                      {searchTerm ? 'No se encontraron productos que coincidan.' : 'Cargando catálogo...'}
                    </td>
                  </tr>
                ) : (
                  visibleProducts.map(p => {
                    const inCart = cart.some(item => item.code === p.code);
                    return (
                      <tr key={p.code} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 leading-tight mb-1">{p.description}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono border border-gray-200">#{p.code}</span>
                              <span className="text-[10px] text-gray-400 uppercase">{p.stock}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <span className="text-lg font-black text-blue-700">
                            {formatCurrency(p.price * (1 + (user.percentage / 100)))}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => addToCart(p)}
                            className={`p-2 rounded-full transition-all transform active:scale-90 ${inCart ? 'bg-green-100 text-green-600' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                          >
                            {inCart ? <CheckIcon size={20} /> : <PlusCircleIcon size={20} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && visibleProducts.length < filteredProducts.length && (
            <div ref={ref} className="p-8 flex justify-center">
              <LoaderIcon className="text-blue-500" />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">© 2026 PrecioSuc - Sistema de Consulta de Precios</p>
        </div>
      </footer>
    </div>
  );
}

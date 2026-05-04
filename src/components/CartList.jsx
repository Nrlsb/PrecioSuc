'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { ShoppingCartIcon, XIcon, Trash2Icon, MinusIcon, PlusIcon } from './Icons';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function CartList({ cartItems, onRemoveItem, onUpdateQuantity, onClearCart, onIncrement, onDecrement, userPercentage }) {
  const [editingQuantity, setEditingQuantity] = useState({});

  const handleQuantityChange = useCallback((code, value) => {
    setEditingQuantity(prev => ({ ...prev, [code]: value }));
    if (value.trim() !== '') {
      onUpdateQuantity(code, value);
    }
  }, [onUpdateQuantity]);

  const handleBlur = useCallback((code) => {
    if (editingQuantity[code] === '' || isNaN(parseInt(editingQuantity[code], 10))) {
      onUpdateQuantity(code, 0);
    }
    setEditingQuantity(prev => {
      const newState = { ...prev };
      delete newState[code];
      return newState;
    });
  }, [editingQuantity, onUpdateQuantity]);

  if (cartItems.length === 0) return null;

  return (
    <div className="mb-6 bg-blue-100 rounded-lg shadow-md border border-blue-300">
      <header className="flex items-center justify-between p-3 sm:p-4 border-b border-blue-300">
        <div className="flex items-center gap-3">
          <ShoppingCartIcon className="text-blue-600" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Productos Seleccionados</h2>
        </div>
        <button onClick={onClearCart} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium transition-colors">
          <XIcon size={14} />
          <span className="hidden sm:inline">Vaciar Lista</span>
        </button>
      </header>

      <div className="sm:hidden divide-y divide-blue-300">
        {cartItems.map(item => (
          <div key={item.code} className="p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-2">
                <p className="font-semibold text-gray-800">{item.description}</p>
                <p className="text-sm text-gray-500">Código: {item.code}</p>
              </div>
              <button onClick={() => onRemoveItem(item.code)} className="text-red-600 hover:text-red-800 p-1">
                <Trash2Icon size={16} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center">
                <button onClick={() => onDecrement(item.code)} className="p-1.5 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors">
                  <MinusIcon size={14} />
                </button>
                <input
                  type="number"
                  value={editingQuantity[item.code] !== undefined ? editingQuantity[item.code] : item.quantity}
                  onChange={(e) => handleQuantityChange(item.code, e.target.value)}
                  onBlur={() => handleBlur(item.code)}
                  className="w-12 text-center border-t border-b border-gray-300 py-1 px-1"
                />
                <button onClick={() => onIncrement(item.code)} className="p-1.5 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors">
                  <PlusIcon size={14} />
                </button>
              </div>
              <p className="font-semibold text-gray-900 text-right">
                {formatCurrency(item.price * (1 + (userPercentage / 100)) * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-blue-300">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quitar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-200">
            {cartItems.map(item => (
              <tr key={item.code}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-center">
                    <button onClick={() => onDecrement(item.code)} className="p-1.5 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 text-gray-700">
                      <MinusIcon size={14} />
                    </button>
                    <input
                      type="number"
                      value={editingQuantity[item.code] !== undefined ? editingQuantity[item.code] : item.quantity}
                      onChange={(e) => handleQuantityChange(item.code, e.target.value)}
                      onBlur={() => handleBlur(item.code)}
                      className="w-14 text-center border-t border-b border-gray-300 py-1 px-1"
                    />
                    <button onClick={() => onIncrement(item.code)} className="p-1.5 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-700">
                      <PlusIcon size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                  {formatCurrency(item.price * (1 + (userPercentage / 100)) * item.quantity)}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <button onClick={() => onRemoveItem(item.code)} className="text-red-600 hover:text-red-800 p-1">
                    <Trash2Icon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="p-3 sm:p-4 border-t border-blue-300 flex justify-end items-center">
        <span className="text-sm font-medium text-gray-700 uppercase mr-4">Total</span>
        <span className="text-xl font-bold text-gray-900">
          {formatCurrency(cartItems.reduce((acc, item) => acc + (item.price * (1 + (userPercentage / 100)) * item.quantity), 0))}
        </span>
      </footer>
    </div>
  );
}

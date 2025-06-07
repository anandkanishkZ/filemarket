import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { File } from '../types';

interface CartItem {
  file: File;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (file: File) => void;
  removeFromCart: (fileId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (file: File) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.file.id === file.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.file.id === file.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { file, quantity: 1 }];
    });
  };

  const removeFromCart = (fileId: string) => {
    setItems(currentItems => currentItems.filter(item => item.file.id !== fileId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.file.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};
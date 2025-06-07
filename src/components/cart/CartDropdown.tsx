import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDropdown: React.FC<CartDropdownProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, getCartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingCart size={20} className="text-gray-600" />
            <span className="ml-2 font-semibold text-gray-800">Shopping Cart</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Your cart is empty
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {items.map((item) => (
              <div key={item.file.id} className="flex items-center space-x-4">
                <img
                  src={item.file.previewUrl}
                  alt={item.file.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.file.title}</h4>
                  <p className="text-gray-600">${item.file.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.file.id)}
                  className="text-red-500 hover:text-red-600"
                  aria-label="Remove item"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between mb-4">
            <span className="font-semibold text-gray-800">Total:</span>
            <span className="font-semibold text-gray-800">
              ${getCartTotal().toFixed(2)}
            </span>
          </div>
          <div className="space-y-2">
            <Link to="/cart">
              <Button fullWidth onClick={onClose}>
                View Cart
              </Button>
            </Link>
            <Link to="/checkout">
              <Button fullWidth variant="outline" onClick={onClose}>
                Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;
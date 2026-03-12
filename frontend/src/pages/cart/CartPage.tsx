import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';

export default function CartPage() {
  const { cart, isLoading, loadCart, updateItem, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) loadCart();
  }, [isAuthenticated, loadCart]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red" />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">Shopping Cart</h1>
      </div>

      {isEmpty ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg font-semibold text-brand-black mb-2">Your cart is empty</p>
          <p className="text-brand-dark/60 text-sm mb-6">
            Add some products to get started
          </p>
          <Link to="/catalog">
            <Button>Browse Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items list */}
          <div className="flex-1 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-brand-black text-sm line-clamp-2">
                    {item.product.name}
                  </h3>

                  {/* Offer info */}
                  {item.offer && (
                    <p className="text-xs text-brand-red mt-0.5">
                      🏷️ {item.offer.title} applied
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-bold text-brand-red">
                      ${item.finalUnitPrice.toFixed(2)}
                    </span>
                    {item.discountAmount > 0 && (
                      <span className="text-xs text-brand-dark/40 line-through">
                        ${item.unitPriceSnapshot.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs text-brand-dark/60">each</span>
                  </div>

                  {/* Quantity + remove */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-brand-border rounded-lg overflow-hidden">
                      <button
                        className="px-3 py-1 text-brand-dark hover:bg-brand-light transition-colors"
                        onClick={() =>
                          item.quantity > 1
                            ? updateItem(item.id, item.quantity - 1)
                            : removeItem(item.id)
                        }
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-sm font-medium border-x border-brand-border">
                        {item.quantity}
                      </span>
                      <button
                        className="px-3 py-1 text-brand-dark hover:bg-brand-light transition-colors"
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-xs text-brand-red hover:underline"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-brand-black">${item.lineTotal.toFixed(2)}</p>
                  {item.discountAmount > 0 && (
                    <p className="text-xs text-brand-red">
                      −${(item.discountAmount * item.quantity).toFixed(2)} saved
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:w-72">
            <div className="card p-5 sticky top-4">
              <h2 className="font-semibold text-brand-black mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-brand-dark/70">
                  <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>
                    $
                    {cart.items
                      .reduce((s, i) => s + i.unitPriceSnapshot * i.quantity, 0)
                      .toFixed(2)}
                  </span>
                </div>
                {cart.totalDiscount > 0 && (
                  <div className="flex justify-between text-brand-red">
                    <span>Discounts</span>
                    <span>−${cart.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-brand-border my-2" />
                <div className="flex justify-between font-bold text-brand-black text-base">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-5"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Link
                to="/catalog"
                className="block text-center text-xs text-brand-dark/60 hover:underline mt-3"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

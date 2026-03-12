import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { CheckoutPreview, Order, ShippingAddress } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

type Step = 'shipping' | 'review' | 'confirmation';

const defaultShipping: ShippingAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<Step>('shipping');
  const [shipping, setShipping] = useState<ShippingAddress>({
    ...defaultShipping,
    email: user?.role !== 'guest' ? user?.email ?? '' : '',
    firstName: user?.role !== 'guest' ? user?.name?.split(' ')[0] ?? '' : '',
    lastName: user?.role !== 'guest' ? user?.name?.split(' ').slice(1).join(' ') ?? '' : '',
  });
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step === 'review') fetchPreview();
  }, [step]);

  const fetchPreview = async () => {
    try {
      const { data } = await api.post<CheckoutPreview>('/checkout/preview');
      setPreview(data);
    } catch {
      setError('Failed to load order preview.');
      setStep('shipping');
    }
  };

  const handleShippingSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<{ order: Order }>('/checkout/confirm', { shipping });
      setConfirmedOrder(data.order);
      clearCart();
      setStep('confirmation');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Checkout failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setShipping((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Confirmation screen ───────────────────────────────────────────────
  if (step === 'confirmation' && confirmedOrder) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-black mb-2">Order Confirmed!</h1>
          <p className="text-brand-dark/60 mb-1">
            Order <span className="font-semibold text-brand-black">#{confirmedOrder.id}</span>
          </p>
          <p className="text-sm text-brand-dark/60 mb-1">
            Payment Reference:{' '}
            <span className="font-mono font-semibold">{confirmedOrder.paymentReference}</span>
          </p>
          <p className="text-2xl font-bold text-brand-red my-4">
            ${confirmedOrder.totalAmount.toFixed(2)}
          </p>
          <p className="text-sm text-brand-dark/60 mb-6">
            Your order is being processed and will be shipped soon.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/orders')}>View My Orders</Button>
            <Button variant="secondary" onClick={() => navigate('/catalog')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {(['shipping', 'review'] as Step[]).map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            {idx > 0 && <div className="h-px w-8 bg-brand-border" />}
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                step === s
                  ? 'text-brand-red'
                  : step === 'confirmation' || (s === 'shipping' && step === 'review')
                  ? 'text-green-600'
                  : 'text-brand-dark/40'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s
                    ? 'bg-brand-red text-white'
                    : s === 'shipping' && step === 'review'
                    ? 'bg-green-500 text-white'
                    : 'bg-brand-border text-brand-dark/40'
                }`}
              >
                {idx + 1}
              </span>
              {s === 'shipping' ? 'Shipping Info' : 'Review & Pay'}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-brand-red text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* ── Step 1: Shipping ───────────────────────────────────────────── */}
      {step === 'shipping' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-brand-black mb-5">Shipping Information</h2>
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" value={shipping.firstName} onChange={set('firstName')} required />
              <Input label="Last Name" value={shipping.lastName} onChange={set('lastName')} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email" type="email" value={shipping.email} onChange={set('email')} required />
              <Input label="Phone" type="tel" value={shipping.phone} onChange={set('phone')} required />
            </div>
            <Input label="Street Address" value={shipping.address} onChange={set('address')} required placeholder="123 Main St" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="City" value={shipping.city} onChange={set('city')} required />
              <Input label="Postal Code" value={shipping.postalCode} onChange={set('postalCode')} required />
              <Input label="Country" value={shipping.country} onChange={set('country')} required placeholder="US" />
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" size="lg">
                Continue to Review →
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Step 2: Review ─────────────────────────────────────────────── */}
      {step === 'review' && preview && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Line items */}
          <div className="flex-1">
            <div className="card p-5">
              <h2 className="text-lg font-semibold text-brand-black mb-4">Order Items</h2>
              <div className="space-y-3">
                {preview.lineItems.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-black line-clamp-1">
                        {item.productName}
                      </p>
                      {item.offer && (
                        <p className="text-xs text-brand-red">{item.offer.title}</p>
                      )}
                      <p className="text-xs text-brand-dark/60">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">${item.lineTotal.toFixed(2)}</p>
                      {item.discountAmount > 0 && (
                        <p className="text-xs text-brand-red">
                          −${(item.discountAmount * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary + confirm */}
          <div className="lg:w-72">
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-brand-black">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-brand-dark/70">
                  <span>Subtotal</span>
                  <span>
                    $
                    {preview.lineItems
                      .reduce((s, i) => s + i.unitPrice * i.quantity, 0)
                      .toFixed(2)}
                  </span>
                </div>
                {preview.totalDiscount > 0 && (
                  <div className="flex justify-between text-brand-red">
                    <span>Discounts</span>
                    <span>−${preview.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-brand-border" />
                <div className="flex justify-between font-bold text-base text-brand-black">
                  <span>Total</span>
                  <span>${preview.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping to */}
              <div className="text-xs text-brand-dark/60 border-t border-brand-border pt-3">
                <p className="font-medium text-brand-black mb-1">Shipping to</p>
                <p>
                  {shipping.firstName} {shipping.lastName}
                </p>
                <p>
                  {shipping.address}, {shipping.city} {shipping.postalCode}
                </p>
                <p>{shipping.country}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                🔒 Simulated payment — no real charge will be made.
              </div>

              <Button
                className="w-full"
                size="lg"
                loading={loading}
                onClick={handleConfirm}
              >
                Place Order
              </Button>
              <button
                className="w-full text-xs text-brand-dark/60 hover:underline"
                onClick={() => setStep('shipping')}
              >
                ← Back to shipping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

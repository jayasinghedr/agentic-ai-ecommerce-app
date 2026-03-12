import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Order } from '../../types';
import Badge from '../../components/ui/Badge';

const STATUS_STEPS = ['Processing', 'Shipped', 'Delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .get<Order>(`/orders/${id}`)
        .then(({ data }) => setOrder(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-brand-dark/60">Order not found.</p>
        <Link to="/orders" className="text-brand-red hover:underline text-sm mt-2 inline-block">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link to="/orders" className="text-sm text-brand-dark/60 hover:text-brand-red flex items-center gap-1 mb-5">
        ← Back to orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Order #{order.id}</h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Placed on{' '}
            {new Date(order.placedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          <p className="text-xs font-mono text-brand-dark/50 mt-0.5">
            Ref: {order.paymentReference}
          </p>
        </div>
        <Badge label={order.status} variant="status" status={order.status} />
      </div>

      {/* Status progress */}
      <div className="card p-5 mb-5">
        <h2 className="text-sm font-semibold text-brand-black mb-4">Tracking</h2>
        <div className="flex items-center">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i <= stepIndex
                      ? 'bg-brand-red text-white'
                      : 'bg-brand-border text-brand-dark/40'
                  }`}
                >
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    i <= stepIndex ? 'text-brand-red font-medium' : 'text-brand-dark/40'
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    i < stepIndex ? 'bg-brand-red' : 'bg-brand-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        {order.notes && (
          <p className="text-xs text-brand-dark/60 mt-3 bg-brand-light rounded px-3 py-2">
            Note: {order.notes}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="card p-5 mb-5">
        <h2 className="text-sm font-semibold text-brand-black mb-4">Items</h2>
        <div className="space-y-3">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-14 h-14 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-black">{item.product.name}</p>
                {item.offerSnapshot && (
                  <p className="text-xs text-brand-red">{item.offerSnapshot.title}</p>
                )}
                <p className="text-xs text-brand-dark/60">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-brand-black">
                ${(item.unitPriceSnapshot * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping + Total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-black mb-3">Shipping Address</h2>
          <div className="text-sm text-brand-dark/70 space-y-0.5">
            <p className="font-medium text-brand-black">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="mt-1">{order.shippingAddress.email}</p>
            <p>{order.shippingAddress.phone}</p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-black mb-3">Payment</h2>
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-brand-dark/70">
              <span>Payment Method</span>
              <span>Simulated</span>
            </div>
            <div className="flex justify-between text-brand-dark/70">
              <span>Reference</span>
              <span className="font-mono text-xs">{order.paymentReference}</span>
            </div>
            <div className="border-t border-brand-border my-2" />
            <div className="flex justify-between font-bold text-brand-black text-base">
              <span>Total Paid</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Order } from '../../types';
import Badge from '../../components/ui/Badge';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Order[]>('/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">My Orders</h1>
        <p className="text-sm text-brand-dark/60 mt-1">Track your order history and status</p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg font-semibold text-brand-black mb-2">No orders yet</p>
          <p className="text-brand-dark/60 text-sm mb-6">
            Your orders will appear here once you've checked out.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-red-dark transition-colors"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow block"
            >
              <div className="flex gap-4 items-start">
                {/* First product image */}
                {order.orderItems?.[0]?.product?.imageUrl && (
                  <img
                    src={order.orderItems[0].product.imageUrl}
                    alt=""
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div>
                  <p className="font-semibold text-brand-black">Order #{order.id}</p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    {new Date(order.placedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    {order.orderItems?.length ?? 0} item
                    {(order.orderItems?.length ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                <Badge label={order.status} variant="status" status={order.status} />
                <p className="font-bold text-brand-black text-lg">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

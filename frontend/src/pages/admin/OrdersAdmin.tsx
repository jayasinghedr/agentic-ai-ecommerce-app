import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Order, OrderStatus } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const STATUSES: OrderStatus[] = ['Processing', 'Shipped', 'Delivered'];

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Processing');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : '';
    const { data } = await api.get<Order[]>(`/admin/orders${params}`);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const openUpdate = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNotes(order.notes ?? '');
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await api.patch(`/admin/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        notes,
      });
      setSelectedOrder(null);
      load();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Orders</h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Manage and update order statuses
          </p>
        </div>

        {/* Status filter */}
        <select
          className="input-field w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-brand-dark/60">
          No orders found.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-black text-white">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Items</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={order.id}
                  className={`border-t border-brand-border ${i % 2 === 0 ? 'bg-white' : 'bg-brand-light'}`}
                >
                  <td className="px-4 py-3 font-medium text-brand-black">#{order.id}</td>
                  <td className="px-4 py-3 text-brand-dark/70">
                    {order.user ? (
                      <div>
                        <p className="font-medium text-brand-black">{order.user.name}</p>
                        <p className="text-xs">{order.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-brand-dark/50">
                        Guest — {order.guestEmail ?? 'N/A'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brand-dark/70">
                    {order.orderItems?.length ?? 0} item
                    {(order.orderItems?.length ?? 0) !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={order.status} variant="status" status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-dark/60">
                    {new Date(order.placedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="secondary" onClick={() => openUpdate(order)}>
                      Update Status
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update status modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order #${selectedOrder?.id}`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              New Status
            </label>
            <select
              className="input-field"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Notes (optional)
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dispatched via FedEx, tracking #XYZ..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button loading={updating} onClick={handleUpdate}>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

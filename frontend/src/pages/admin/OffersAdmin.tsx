import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Offer, Product } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const toDatetimeLocal = (iso: string) =>
  new Date(iso).toISOString().slice(0, 16);

const nowIso = () => new Date().toISOString().slice(0, 16);
const futureIso = (days = 30) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 16);

const emptyForm = {
  title: '',
  description: '',
  discountType: 'percentage' as 'percentage' | 'fixed_amount',
  discountValue: '',
  startDate: nowIso(),
  endDate: futureIso(),
  isActive: true,
  productId: '',
};

export default function OffersAdmin() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const [offersRes, productsRes] = await Promise.all([
      api.get<Offer[]>('/admin/offers'),
      api.get<Product[]>('/admin/products'),
    ]);
    setOffers(offersRes.data);
    setProducts(productsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, startDate: nowIso(), endDate: futureIso() });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (o: Offer) => {
    setEditing(o);
    setForm({
      title: o.title,
      description: o.description,
      discountType: o.discountType,
      discountValue: String(o.discountValue),
      startDate: toDatetimeLocal(o.startDate),
      endDate: toDatetimeLocal(o.endDate),
      isActive: o.isActive,
      productId: String(o.productId),
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: form.isActive,
        productId: parseInt(form.productId),
      };
      if (editing) {
        await api.patch(`/offers/${editing.id}`, payload);
      } else {
        await api.post('/offers', payload);
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Save failed.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this offer?')) return;
    await api.delete(`/offers/${id}`);
    load();
  };

  const set = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Offers & Discounts</h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Manage item-wise promotions
          </p>
        </div>
        <Button onClick={openCreate}>+ Add Offer</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-black text-white">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Offer</th>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-left px-4 py-3 font-medium">Valid Until</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {offers.map((o, i) => {
                const isExpired = new Date(o.endDate) < new Date();
                return (
                  <tr
                    key={o.id}
                    className={`border-t border-brand-border ${i % 2 === 0 ? 'bg-white' : 'bg-brand-light'}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-black">{o.title}</p>
                      <p className="text-xs text-brand-dark/60 line-clamp-1">{o.description}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-dark/70">
                      {o.product?.name ?? `Product #${o.productId}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-offer">
                        {o.discountType === 'percentage'
                          ? `${o.discountValue}%`
                          : `$${o.discountValue}`}{' '}
                        OFF
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-dark/60">
                      {new Date(o.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          o.isActive && !isExpired
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {!o.isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(o)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(o.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Offer' : 'Add Offer'}
        size="lg"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-brand-red text-sm rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={set('title')} required />
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Description
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={form.description}
              onChange={set('description')}
              required
            />
          </div>

          {/* Product selector */}
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Product
            </label>
            <select
              className="input-field"
              value={form.productId}
              onChange={set('productId')}
              required
            >
              <option value="">Select a product...</option>
              {products.filter(p => p.isActive).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ${p.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">
                Discount Type
              </label>
              <select
                className="input-field"
                value={form.discountType}
                onChange={set('discountType')}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount ($)</option>
              </select>
            </div>
            <Input
              label={form.discountType === 'percentage' ? 'Value (%)' : 'Value ($)'}
              type="number"
              step="0.01"
              value={form.discountValue}
              onChange={set('discountValue')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Start Date</label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.startDate}
                onChange={set('startDate')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">End Date</label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.endDate}
                onChange={set('endDate')}
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-brand-dark cursor-pointer">
            <input
              type="checkbox"
              className="accent-brand-red w-4 h-4"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Active
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave}>
              {editing ? 'Save Changes' : 'Create Offer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

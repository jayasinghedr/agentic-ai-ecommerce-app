import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Product } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  isActive: true,
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await api.get<Product[]>('/admin/products');
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      imageUrl: p.imageUrl,
      isActive: p.isActive,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        imageUrl: form.imageUrl,
        isActive: form.isActive,
      };
      if (editing) {
        await api.patch(`/products/${editing.id}`, payload);
      } else {
        await api.post('/products', payload);
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
    if (!confirm('Deactivate this product?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const set = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Products</h1>
          <p className="text-sm text-brand-dark/60 mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={openCreate}>+ Add Product</Button>
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
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
                <th className="text-left px-4 py-3 font-medium">Offers</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-t border-brand-border ${i % 2 === 0 ? 'bg-white' : 'bg-brand-light'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-brand-black">{p.name}</p>
                        <p className="text-xs text-brand-dark/60 line-clamp-1 max-w-xs">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? 'text-brand-red font-medium' : ''}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-dark/60">
                    {p.offers?.length ?? 0} offer{(p.offers?.length ?? 0) !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>
                        Deactivate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-brand-red text-sm rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={set('name')} required />
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Description
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={form.description}
              onChange={set('description')}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              required
            />
            <Input
              label="Stock"
              type="number"
              value={form.stock}
              onChange={set('stock')}
              required
            />
          </div>
          <Input
            label="Image URL"
            type="url"
            value={form.imageUrl}
            onChange={set('imageUrl')}
            placeholder="https://..."
            required
          />
          <label className="flex items-center gap-2 text-sm text-brand-dark cursor-pointer">
            <input
              type="checkbox"
              className="accent-brand-red w-4 h-4"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Active (visible to shoppers)
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave}>
              {editing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

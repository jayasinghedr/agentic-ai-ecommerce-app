import { useEffect, useState, useCallback } from 'react';
import api from '../../api/client';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import Input from '../../components/ui/Input';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (inStockOnly) params.set('inStock', 'true');

      const { data } = await api.get<Product[]>(`/products?${params.toString()}`);
      setProducts(data);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [search, minPrice, maxPrice, inStockOnly]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">Product Catalog</h1>
        <p className="text-sm text-brand-dark/60 mt-1">
          Browse our collection of quality products
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <Input
            label="Search products"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-32">
          <Input
            label="Min price ($)"
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="w-32">
          <Input
            label="Max price ($)"
            type="number"
            placeholder="9999"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-dark cursor-pointer pb-2">
          <input
            type="checkbox"
            className="accent-brand-red w-4 h-4"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          In stock only
        </label>
      </div>

      {/* Results */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-brand-red rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-8 bg-gray-200 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-brand-dark/60">No products found matching your filters.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-brand-dark/50 mb-3">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

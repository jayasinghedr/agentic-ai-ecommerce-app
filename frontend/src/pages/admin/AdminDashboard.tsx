import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Metrics } from '../../types';

interface MetricCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Metrics>('/admin/metrics')
      .then(({ data }) => setMetrics(data))
      .finally(() => setLoading(false));
  }, []);

  const cards: MetricCard[] = metrics
    ? [
        {
          label: 'Total Orders',
          value: metrics.totalOrders,
          icon: '📋',
          color: 'bg-blue-50 text-blue-700',
        },
        {
          label: 'Active Products',
          value: metrics.totalProducts,
          icon: '📦',
          color: 'bg-green-50 text-green-700',
        },
        {
          label: 'Active Offers',
          value: metrics.activeOffers,
          icon: '🏷️',
          color: 'bg-yellow-50 text-yellow-700',
        },
        {
          label: 'Total Revenue',
          value: `$${metrics.totalRevenue.toFixed(2)}`,
          icon: '💰',
          color: 'bg-red-50 text-brand-red',
        },
        {
          label: 'Registered Users',
          value: metrics.totalUsers,
          icon: '👥',
          color: 'bg-purple-50 text-purple-700',
        },
      ]
    : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">Admin Dashboard</h1>
        <p className="text-sm text-brand-dark/60 mt-1">
          Overview of your store's performance
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="card p-6">
              <div className={`inline-flex text-2xl mb-3 w-12 h-12 items-center justify-center rounded-xl ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-brand-black">{card.value}</p>
              <p className="text-xs text-brand-dark/60 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/products', icon: '📦', title: 'Manage Products', desc: 'Add, edit, or remove products from your catalog' },
          { href: '/admin/offers', icon: '🏷️', title: 'Manage Offers', desc: 'Create and manage item-wise discounts and promotions' },
          { href: '/admin/orders', icon: '📋', title: 'Manage Orders', desc: 'View and update order statuses' },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="card p-5 hover:shadow-md transition-shadow flex gap-4 items-start group"
          >
            <span className="text-2xl">{link.icon}</span>
            <div>
              <p className="font-semibold text-brand-black group-hover:text-brand-red transition-colors">
                {link.title}
              </p>
              <p className="text-xs text-brand-dark/60 mt-0.5">{link.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

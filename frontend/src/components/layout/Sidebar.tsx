import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const shopLinks = [
  { to: '/catalog', label: 'Catalog', icon: '🛍️' },
  { to: '/cart', label: 'Cart', icon: '🛒', badge: true },
  { to: '/orders', label: 'My Orders', icon: '📦', authRequired: true },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/offers', label: 'Offers', icon: '🏷️' },
  { to: '/admin/orders', label: 'Orders', icon: '📋' },
];

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Admin sidebar — dark theme
  if (isAdmin) {
    return (
      <aside className="w-64 min-h-screen bg-brand-black text-white flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-brand-red font-bold text-lg tracking-wide">NexaGear</span>
          <p className="text-xs text-white/40 mt-0.5">Admin Portal</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-red text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Shop link for admin */}
        <div className="px-3 pb-2 border-t border-white/10 pt-3">
          <NavLink
            to="/catalog"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>🛍️</span> Visit Shop
          </NavLink>
        </div>

        {/* User info + Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-white/40 truncate">{user?.name}</p>
          <p className="text-xs text-white/30 truncate mb-3">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-white/60 hover:text-white border border-white/20 rounded-lg py-1.5 hover:bg-white/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
    );
  }

  // Shopper sidebar — light theme
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-brand-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-border">
        <span className="text-brand-red font-bold text-lg tracking-wide">NexaGear</span>
        <p className="text-xs text-brand-dark/60 mt-0.5">Next-gen, every gear</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {shopLinks.map((link) => {
          if (link.authRequired && !isAuthenticated) return null;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-red-50 text-brand-red font-medium border-l-2 border-brand-red pl-[10px]'
                    : 'text-brand-dark hover:bg-brand-light'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <span className="text-base">{link.icon}</span>
                {link.label}
              </span>
              {link.badge && cartCount > 0 && (
                <span className="bg-brand-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Auth section */}
      <div className="px-4 py-4 border-t border-brand-border">
        {isAuthenticated ? (
          <>
            <p className="text-xs text-brand-dark font-medium truncate">{user?.name}</p>
            <p className="text-xs text-brand-dark/60 truncate mb-3">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="w-full text-xs text-brand-dark border border-brand-border rounded-lg py-1.5 hover:bg-brand-light transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <NavLink
              to="/login"
              className="block w-full text-center text-sm btn-primary py-2 rounded-lg"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="block w-full text-center text-sm btn-secondary py-2 rounded-lg"
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}

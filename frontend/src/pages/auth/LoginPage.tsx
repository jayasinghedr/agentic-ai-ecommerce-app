import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const { login, guestLogin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/catalog';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    try {
      await guestLogin();
      navigate('/catalog');
    } catch {
      setError('Could not start guest session.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-red mb-1">NexaGear</h1>
          <p className="text-brand-dark/60 text-sm">Next-gen, every gear</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-brand-red text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center text-xs text-brand-dark/60">
              <span className="bg-white px-3">or</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            loading={guestLoading}
            onClick={handleGuest}
          >
            Continue as Guest
          </Button>

          <p className="text-center text-sm text-brand-dark/60 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-red font-medium hover:underline">
              Register
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 bg-brand-light rounded-lg text-xs text-brand-dark/70 space-y-1">
            <p className="font-semibold">Demo accounts:</p>
            <p>Admin: <span className="font-mono">admin@nexagear.com</span> / admin123</p>
            <p>Customer: <span className="font-mono">john@example.com</span> / customer123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Pax from '@/components/Pax';
import { Link } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Supabase auth integration
    console.log({ email, password, isLogin });
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <Link to="/" className="mb-8">
        <h1 className="text-3xl font-extrabold text-midnight">🎒 UNPACK</h1>
      </Link>

      <Pax state="idle" size="sm" />

      <div className="bg-white rounded-3xl shadow-md p-8 w-full max-w-sm mt-6">
        <h2 className="text-xl font-bold text-midnight mb-6 text-center">
          {isLogin ? 'Welcome back' : 'Get started'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-bark mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-peach/30 px-4 py-3 bg-cream/50 text-midnight focus:outline-none focus:ring-2 focus:ring-coral/30 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-bark mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-peach/30 px-4 py-3 bg-cream/50 text-midnight focus:outline-none focus:ring-2 focus:ring-coral/30 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" isLoading={loading}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-bark/60 mt-4">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-coral font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}

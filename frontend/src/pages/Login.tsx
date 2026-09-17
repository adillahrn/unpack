import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate('/unpack');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-margin relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none" />

      <Link to="/" className="relative z-10 flex items-center gap-space-sm mb-space-xl">
        <img
          alt="UNPACK Brand Logo"
          className="h-8 w-auto object-contain"
          src="/unpack_logo.png"
        />
        <span className="font-headline-md text-headline-md text-on-surface tracking-tight font-extrabold">
          UNPACK
        </span>
      </Link>

      <div className="relative z-10 bg-surface-container-lowest rounded-xl shadow-md p-space-lg w-full max-w-sm">
        {/* Washi tape accent */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-primary-fixed/60 -rotate-1 rounded-sm shadow-sm pointer-events-none" />

        <h2 className="text-headline-md text-on-surface mb-space-xs text-center">
          Welcome back
        </h2>
        <p className="text-body-sm text-on-surface-variant text-center mb-space-lg">
          Sign in to continue your journey
        </p>

        {error && (
          <div className="mb-space-md p-space-sm rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div>
            <label htmlFor="email" className="block text-label-md text-on-surface-variant mb-space-xs">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-surface-container-low px-space-md py-space-sm text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              placeholder="you@university.edu"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-label-md text-on-surface-variant mb-space-xs">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-surface-container-low px-space-md py-space-sm text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-body-sm text-on-surface-variant mt-space-lg">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

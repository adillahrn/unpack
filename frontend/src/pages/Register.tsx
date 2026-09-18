import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate('/unpack');
      return;
    }

    setSuccess('Pendaftaran berhasil! Cek email kamu untuk verifikasi sebelum login.');
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/unpack`,
      },
    });
    if (oauthError) setError(oauthError.message);
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
          Create account
        </h2>
        <p className="text-body-sm text-on-surface-variant text-center mb-space-lg">
          Join UNPACK and start unpacking your mind
        </p>

        {error && (
          <div className="mb-space-md p-space-sm rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-space-md p-space-sm rounded-lg bg-secondary-container text-on-secondary-container text-body-sm flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div>
            <label htmlFor="name" className="block text-label-md text-on-surface-variant mb-space-xs">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-surface-container-low px-space-md py-space-sm text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              placeholder="Nama lengkap kamu"
              required
            />
          </div>

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
              placeholder="nama@email.com"
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
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-label-md text-on-surface-variant mb-space-xs">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl bg-surface-container-low px-space-md py-space-sm text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              placeholder="Ulangi password"
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
                <span>Membuat akun…</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-space-sm my-space-lg">
          <div className="h-px bg-outline-variant flex-1" />
          <span className="text-body-sm text-on-surface-variant">atau</span>
          <div className="h-px bg-outline-variant flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-full border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-lg text-label-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <p className="text-center text-body-sm text-on-surface-variant mt-space-lg">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
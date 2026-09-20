import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(t('auth.errorRequired', 'Email dan password wajib diisi.'));
      return;
    }

    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(t('auth.errorCreds', 'Email atau password salah.'));
      return;
    }

    if (data.session) {
      navigate('/unpack');
    }
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
      {/* Top right language switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

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
          {t('auth.welcome', 'Welcome back')}
        </h2>
        <p className="text-body-sm text-on-surface-variant text-center mb-space-lg">
          {t('auth.welcomeSub', 'Sign in to continue your journey')}
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
              {t('auth.email', 'Email')}
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
              {t('auth.password', 'Password')}
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
                <span>{t('auth.signingIn', 'Signing in…')}</span>
              </>
            ) : (
              <>
                <span>{t('auth.signIn', 'Sign In')}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-space-sm my-space-lg">
          <div className="h-px bg-outline-variant flex-1" />
          <span className="text-body-sm text-on-surface-variant">{t('auth.or', 'or')}</span>
          <div className="h-px bg-outline-variant flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-full border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-lg text-label-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <GoogleIcon />
          <span>{t('auth.continueGoogle', 'Continue with Google')}</span>
        </button>

        <p className="text-center text-body-sm text-on-surface-variant mt-space-lg">
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            {t('auth.signUp', 'Sign Up')}
          </Link>
        </p>
      </div>
    </div>
  );
}
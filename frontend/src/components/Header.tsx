import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/unpack', label: 'Unpack' },
  { path: '/start-here', label: 'Start Here' },
  { path: '/my-bag', label: 'My Bag' },
  { path: '/progress', label: 'Progress' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_2px_8px_-2px_rgba(41,37,36,0.05)]">
        <div className="h-20 max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between gap-gutter">
          <Link to="/" className="flex items-center gap-space-sm">
            <img
              alt="UNPACK Brand Logo"
              className="h-8 w-auto object-contain"
              src="/unpack_logo.png"
            />
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight font-extrabold">
              UNPACK
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-space-xs bg-surface-container-low px-space-xs py-space-xs rounded-full shadow-[0_1px_3px_rgba(41,37,36,0.04)]">
            {navItems.map(({ path, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`px-space-md py-space-sm rounded-full font-label-md transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-[0_2px_6px_rgba(107,56,212,0.25)]'
                      : 'text-label-md text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-space-md">
            <Link
              to="/unpack"
              className="hidden sm:inline-flex items-center justify-center px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all"
            >
              Unpack your mind
            </Link>

            {session ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer group"
                title={`Logout (${session.user?.email ?? ''})`}
              >
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                  logout
                </span>
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Login"
                title="Login"
              >
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 z-50 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, label }) => {
            const isActive = location.pathname === path;
            let icon = 'home';
            if (path === '/unpack') icon = 'psychology';
            if (path === '/start-here') icon = 'play_circle';
            if (path === '/my-bag') icon = 'backpack';
            if (path === '/progress') icon = 'insights';

            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {icon}
                </span>
                <span className="text-[10px] font-label-sm mt-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

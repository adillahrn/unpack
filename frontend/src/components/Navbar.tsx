import { Link, useLocation } from 'react-router-dom';
import { Backpack, Home, Brain, BarChart3, BookOpen, Compass } from 'lucide-react';

const navItems = [
  { path: '/unpack', label: 'Unpack', icon: Brain },
  { path: '/my-bag', label: 'My Bag', icon: Backpack },
  { path: '/start-here', label: 'Start Here', icon: Compass },
  { path: '/progress', label: 'Progress', icon: BarChart3 },
  { path: '/learn', label: 'Learn', icon: BookOpen },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-peach/30 z-40 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between md:justify-start md:gap-8 h-16">
          <Link to="/" className="hidden md:flex items-center gap-2 font-bold text-xl text-midnight">
            <span>🎒</span>
            <span>UNPACK</span>
          </Link>
          <div className="flex items-center justify-around w-full md:w-auto md:gap-1 md:ml-auto">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-coral bg-coral/10'
                      : 'text-bark/60 hover:text-bark hover:bg-peach/20'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

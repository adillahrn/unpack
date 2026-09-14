import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="pt-4 pb-20 md:pt-20 md:pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

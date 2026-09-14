import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface flex flex-col">
      <Header />
      <main className="w-full pt-20 bg-surface flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

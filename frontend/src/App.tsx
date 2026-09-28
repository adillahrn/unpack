import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import AppLayout from '@/layouts/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Unpack from '@/pages/Unpack';
import MyBag from '@/pages/MyBag';
import Unwind from '@/pages/Unwind';
import Learn from '@/pages/Learn';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/unpack',
        element: (
          <ProtectedRoute>
            <Unpack />
          </ProtectedRoute>
        ),
      },
      {
        path: '/my-bag',
        element: (
          <ProtectedRoute>
            <MyBag />
          </ProtectedRoute>
        ),
      },
      {
        path: '/unwind',
        element: (
          <ProtectedRoute>
            <Unwind />
          </ProtectedRoute>
        ),
      },
      {
        path: '/learn',
        element: (
          <ProtectedRoute>
            <Learn />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default function App() {
  return (
    <I18nProvider defaultLocale="id">
      <RouterProvider router={router} />
    </I18nProvider>
  );
}

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Unpack from '@/pages/Unpack';
import MyBag from '@/pages/MyBag';
import StartHere from '@/pages/StartHere';
import Progress from '@/pages/Progress';
import Learn from '@/pages/Learn';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/unpack', element: <Unpack /> },
      { path: '/my-bag', element: <MyBag /> },
      { path: '/start-here', element: <StartHere /> },
      { path: '/progress', element: <Progress /> },
      { path: '/learn', element: <Learn /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

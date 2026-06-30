import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage    from './pages/HomePage';
import InputForm   from './pages/InputForm';
import ProfilePage from './pages/ProfilePage';
import ResultPage  from './pages/ResultPage';

const router = createBrowserRouter([
    { path: '/',           Component: HomePage },
    { path: '/inputform',  Component: InputForm },
    { path: '/rider/:id',  Component: ProfilePage },
    { path: '/result/:id', Component: ResultPage },
    { path: '/u/:id',      Component: ResultPage },  // legacy QR scan target
]);

export default function App() {
    return <RouterProvider router={router} />;
}

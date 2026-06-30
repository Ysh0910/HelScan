import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from '../components/HomePage';
import InputForm from '../components/inputForm';
import ProfilePage from '../components/ProfilePage';
import ResultPage from '../components/ResultPage';

const router = createBrowserRouter([
    { path: '/',           Component: HomePage },
    { path: '/inputform',  Component: InputForm },
    { path: '/rider/:id',  Component: ProfilePage },
    { path: '/result/:id', Component: ResultPage },   // post-submission: QR + download
    { path: '/u/:id',      Component: ResultPage },   // public scan target
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;

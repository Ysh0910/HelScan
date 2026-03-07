import './App.css';
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import InputForm from '../components/inputForm';
import ProfilePage from '../components/ProfilePage';
import resultPage from '../components/resultPage';

let Router = createBrowserRouter([
  { path: "/inputform", Component: InputForm },
  { path: "/rider/:id", Component: ProfilePage},
  { path: "/u/:id", Component:resultPage}
]);

function App() {

  return (
    <div>
      <RouterProvider router={Router}/>
    </div>
  )
}

export default App

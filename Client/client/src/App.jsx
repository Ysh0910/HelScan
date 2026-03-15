import './App.css';
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import InputForm from '../components/inputForm';
import ProfilePage from '../components/ProfilePage';
import ResultPage from '../components/ResultPage';

let Router = createBrowserRouter([
  { path: "/inputform", Component: InputForm },
  { path: "/rider/:id", Component: ProfilePage},
  { path: "/u/:id", Component:ResultPage}
]);

function App() {

  return (
    <div>
      <RouterProvider router={Router}/>
    </div>
  )
}

export default App

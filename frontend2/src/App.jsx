import { useState } from 'react'
import './App.css'
import { useRoutes } from 'react-router-dom';
import Homepage from "./pages/Homepage";
import Chatpage from "./pages/Chatpage";

function App() {

  return (
    <div className="App">
      {useRoutes([
          { path: "/", element: <Homepage /> },
          { path: "/chat", element: <Chatpage /> },
          { path: "*", element: <h1>404: Not Found</h1> }
        ])}

      
    </div>
  )
}

export default App

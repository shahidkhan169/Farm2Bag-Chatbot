import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Nav from './Nav.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Register/>
    
  </StrictMode>,
)

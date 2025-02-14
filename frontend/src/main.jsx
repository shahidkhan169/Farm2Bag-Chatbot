import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Farm from './Farm.jsx'
import Addcart from './Addcart.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Farm />
  </StrictMode>,
)

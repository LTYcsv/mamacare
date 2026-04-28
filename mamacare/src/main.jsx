import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MamaCare from './MamaCare.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MamaCare />
  </StrictMode>,
)

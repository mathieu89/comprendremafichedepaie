import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { RouteProvider } from '@/providers/route-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { PayslipProvider } from '@/context/PayslipContext'
import App from './App.jsx'
import '@/styles/globals.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RouteProvider>
        <ThemeProvider>
          <PayslipProvider>
            <App />
          </PayslipProvider>
        </ThemeProvider>
      </RouteProvider>
    </BrowserRouter>
  </StrictMode>,
)

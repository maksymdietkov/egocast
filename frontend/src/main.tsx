import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'
import { AppInfo } from './components/AppInfo.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <AppInfo />
  </StrictMode>,
)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'
import { AppInfo } from './components/AppInfo.tsx'
import { trackVisit } from './api/stats'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <AppInfo />
  </StrictMode>,
)

trackVisit()

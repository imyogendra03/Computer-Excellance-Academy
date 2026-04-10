import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./components/ui/app-ui.css"
import "./styles/legacyPublicTheme.css"
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { setupAuthSession } from './services/authSession'
import "../node_modules/bootstrap/dist/css/bootstrap.css"
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.js"

setupAuthSession()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

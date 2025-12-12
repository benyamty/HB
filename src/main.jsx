import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Check if on desktop (not mobile)
const isDesktop = window.innerWidth > 500

function PhoneFrame({ children }) {
  if (!isDesktop) return children
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#1a1a1a',
      padding: '20px'
    }}>
      <div style={{
        width: '390px',
        height: '844px',
        borderRadius: '50px',
        background: '#000',
        padding: '12px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '40px',
          overflow: 'hidden',
          position: 'relative',
          background: '#ffffff'
        }}>
          {/* Notch */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '150px',
            height: '30px',
            background: '#000',
            borderRadius: '0 0 20px 20px',
            zIndex: 100
          }} />
          {children}
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PhoneFrame>
      <App />
    </PhoneFrame>
  </StrictMode>,
)

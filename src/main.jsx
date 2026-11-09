import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

const host = window.location.hostname
const isNonProd =
  host.includes('.staging.') ||
  host.includes('.dev.') ||
  host.endsWith('.vercel.app') ||
  host === 'localhost'
if (isNonProd) {
  const meta = document.createElement('meta')
  meta.name = 'robots'
  meta.content = 'noindex, nofollow'
  document.head.appendChild(meta)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)

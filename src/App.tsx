
import { Route, Routes, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MapPage from './pages/MapPage'
import NewPointPage from './pages/NewPointPage'
import PublicPage from './pages/PublicPage'
import MyRecordsPage from './pages/MyRecordsPage'
import './styles.css'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark'
    setDarkMode(isDark)
    if (isDark) document.body.classList.add('dark')
  }, [])

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newMode = !prev
      if (newMode) document.body.classList.add('dark')
      else document.body.classList.remove('dark')
      localStorage.setItem('theme', newMode ? 'dark' : 'light')
      return newMode
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand">OmniMap</Link>
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/">Mapa</Link>
          <Link to="/new">Novo Ponto</Link>
          <Link to="/consulta">Consulta Pública</Link>
          <Link to="/meus-registros">Meus Registros</Link>
          <button onClick={toggleTheme} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            {darkMode ? '☀️ Claro' : '🌙 Escuro'}
          </button>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/new" element={<NewPointPage />} />
          <Route path="/consulta" element={<PublicPage />} />
          <Route path="/meus-registros" element={<MyRecordsPage />} />
        </Routes>
      </main>
    </div>
  )
}

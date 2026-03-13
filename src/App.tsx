import { Route, Routes, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MapPage from './pages/MapPage'
import NewPointPage from './pages/NewPointPage'
import PublicPage from './pages/PublicPage'
import MyRecordsPage from './pages/MyRecordsPage'
import ToastContainer from './components/ToastContainer'
import './styles.css'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark'
    setDarkMode(isDark)
    if (isDark) document.body.classList.add('dark')
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand" aria-label="Ir para página inicial" onClick={closeMenu}>OmniMap</Link>
        
        {isMobile && (
          <button 
            className="menu-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
          </button>
        )}

        <nav 
          className={menuOpen ? 'open' : ''}
          style={{ 
            display: isMobile ? (menuOpen ? 'flex' : 'none') : 'flex', 
            gap: 12, 
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            position: isMobile ? 'absolute' : 'static',
            top: isMobile ? '100%' : 'auto',
            right: isMobile ? '0' : 'auto',
            background: isMobile ? 'var(--header-bg)' : 'transparent',
            padding: isMobile ? '16px' : '0',
            borderRadius: isMobile ? '0 0 0 8px' : '0',
            zIndex: 99
          }} 
          role="navigation" 
          aria-label="Menu principal"
        >
          <Link to="/" onClick={closeMenu}>Mapa</Link>
          <Link to="/new" onClick={closeMenu}>Novo Ponto</Link>
          <Link to="/consulta" onClick={closeMenu}>Consulta</Link>
          <Link to="/meus-registros" onClick={closeMenu}>Meus Registros</Link>
          <button 
            onClick={toggleTheme} 
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
            aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
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
      <ToastContainer />
    </div>
  )
}

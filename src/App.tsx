import { useState } from 'react'
import Login from './pages/Login'
import UsuarioPages from './pages/UsuarioPages'



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('token')
  })

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
  }

  return (
    <div>
      {/* Si ya estamos logueados, mostramos el botón de cerrar sesión arriba */}
      {isLoggedIn && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          padding: '15px 30px', 
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155'
        }}>
          <button className="btn btn-danger" onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      )}

     {/* Lógica principal: Si no está logueado, muestra Login. Si lo está, muestra Usuarios */}
      {!isLoggedIn ? (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <UsuarioPages /> // 👈 Aquí se dibuja tu tabla de usuarios
      )}
    </div>
  )
}


export default App

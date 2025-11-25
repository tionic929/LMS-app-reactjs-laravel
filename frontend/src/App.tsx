import { useEffect, useState } from 'react'
import Sidebar from './layouts/sidebar'
import Navbar from './layouts/navbar'
import Footer from './layouts/footer'
import Users from './layouts/users'
import Register from './layouts/Register'
import Login from './layouts/Login'
import './App.css'

function App() {
  const [route, setRoute] = useState<string>(() => window.location.hash.replace('#', '') || '/')

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', '') || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const renderMain = () => {
    if (route === '/users') return <Users />
    else if (route === '/register') return <Register />
    else if (route === '/login') return <Login />

    return (
      <div className="w-full h-full flex items-center justify-center">
        <h1 className="text-6xl md:text-8xl font-extrabold">Kalbo</h1>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-auto p-6">{renderMain()}</main>

        <Footer />
      </div>
    </div>
  )
}

export default App
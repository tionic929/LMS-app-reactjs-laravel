import { useEffect, useState } from 'react'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import Sidebar from './layouts/sidebar'
import Navbar from './layouts/navbar'
import Footer from './layouts/footer'
import Users from './layouts/users'
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

    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-4 items-center mb-6">
          <a href="https://vite.dev" target="_blank" rel="noopener">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>

        <div className="text-2xl">HELLO</div>
        <div className="text-5xl">HELLO</div>

        <h1 className="mt-6">Vite + React</h1>
        <div className="card mt-4">
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs mt-4">Click on the Vite and React logos to learn more</p>
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
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Sidebar from './layouts/sidebar'
import Navbar from './layouts/navbar'
import Footer from './layouts/footer'
import Users from './pages/Users'
import Announcements from './pages/AnnouncementsPage'
import Register from './pages/Register'
import Login from './pages/Login'
import './App.css'

function App() {


  return (
    <Router>
      <div className="h-screen flex">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <main className="flex-1 overflow-auto p-6">
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
                  <p className="read-the-docs mt-4">
                    Click on the Vite and React logos to learn more
                  </p>
                </div>
              </main>
            } />
            <Route path="/users" element={<Users />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
          <Footer />
        </div>
      </div>
    </Router>
  )
}

export default App;

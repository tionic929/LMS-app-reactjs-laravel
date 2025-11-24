import { useState } from 'react'
import './App.css'
import Sidebar from './layouts/sidebar'
import Footer from './layouts/footer'
import Navbar from './layouts/navbar'

function App() {
  return (
    <>
    <div className="h-screen flex">
      <Sidebar />
        <div className="flex-1 flex flex-col">
        <Navbar />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">

              <div className="mt-6">
                <div className="text-2xl">HELLO</div>
                <div className="text-5xl">HELLO</div>
              </div>

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
        <Footer />
        </div>
      </div>
      </>
  )
}

export default App
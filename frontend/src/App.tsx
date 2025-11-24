import { useState } from 'react'
import './App.css'
import Sidebar from './layouts/sidebar'
import Footer from './layouts/footer'

function App() {
  return (
    <div className="h-screen w-screen flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            <a href="https://vite.dev" target="_blank" rel="noopener">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" rel="noopener">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>

          <div className="mt-6">
            <div className="text-2xl">HELLO</div>
            <div className="text-5xl">HELLO</div>
          </div>

          <h1 className="mt-6">Vite + React</h1>

          <div className="card mt-4">
            <button onClick={() => setCount((c) => c + 1)}>
              count is {count}
            </button>
            <p>
              Edit <code>src/App.tsx</code> and save to test HMR
            </p>
          </div>

          <p className="read-the-docs mt-4">
            Click on the Vite and React logos to learn more
          </p>
        </div>
      </main>
    </div>
    <>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-3xl font-bold underline">
          Hello world!
        </h1>
      </main>
      <Footer />
    </>
  )
}

export default App
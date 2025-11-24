import { useState } from 'react'
import './App.css'
import Footer from './layouts/footer'

function App() {
  return (
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

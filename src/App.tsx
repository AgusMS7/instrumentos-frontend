import type React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Navbar } from "./components/Navbar"
import { Home } from "./pages/Home"
import { Productos } from "./pages/Productos"
import { DetalleInstrumento } from "./pages/DetalleInstrumento"
import { DondeEstamos } from "./pages/DondeEstamos"
import { Admin } from "./pages/Admin"
import "./App.css"

const App: React.FC = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/instrumento/:id" element={<DetalleInstrumento />} />
            <Route path="/donde-estamos" element={<DondeEstamos />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

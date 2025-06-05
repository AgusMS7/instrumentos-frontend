import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Home } from "./pages/Home"
import { Navbar } from "./components/Navbar"
import { DondeEstamos } from "./pages/DondeEstamos"
import { Productos } from "./pages/Productos"
import { DetalleInstrumento } from "./pages/DetalleInstrumento"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donde-estamos" element={<DondeEstamos />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/instrumento/:id" element={<DetalleInstrumento />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

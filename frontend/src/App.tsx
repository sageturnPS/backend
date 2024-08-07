import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Placeholder */}
          <Route index element={<div></div>} />
          <Route path="*" element={<div></div>} />
        </Routes>
      </Router>
    </>
  )
}

export default App

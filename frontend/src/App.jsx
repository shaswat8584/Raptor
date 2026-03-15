import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ShelfPage from './pages/ShelfPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shelf/:id" element={<ShelfPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

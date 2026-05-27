import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import Admin from '@/pages/Admin';
import ReservePage from '@/pages/ReservePage';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/reserve" element={<ReservePage />} />
    </Routes>
  </BrowserRouter>
);

export default App;

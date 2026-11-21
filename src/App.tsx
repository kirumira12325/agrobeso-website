import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import Admin from '@/pages/Admin';
import ReservePage from '@/pages/ReservePage';
import LocationPage from '@/pages/LocationPage';
import MenuPage from '@/pages/MenuPage';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/reserve" element={<ReservePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/peckham" element={<LocationPage id="peckham" />} />
      <Route path="/thornton-heath" element={<LocationPage id="thornton-heath" />} />
    </Routes>
  </BrowserRouter>
);

export default App;

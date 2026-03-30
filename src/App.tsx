import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer.tsx'; // Explicitly specifying .tsx for IDE resolution

import Home from './pages/Home';
import About from './pages/About';
import Culture from './pages/Culture';
import Team from './pages/Team';
import Portfolio from './pages/Portfolio';
import PropertyDetail from './pages/PropertyDetail';
import Services from './pages/Services';
import Development from './pages/Development';
import Awards from './pages/Awards';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminPanel from './pages/admin/AdminPanel';
import ScrollToTop from './components/ScrollToTop';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdminRoute && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/team" element={<Team />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:slug" element={<PropertyDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/development" element={<Development />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppLayout />
    </Router>
  );
}

export default App;

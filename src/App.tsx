import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer.tsx'; // Explicitly specifying .tsx for IDE resolution
import InitialLoader from './components/InitialLoader';
import { prefetchPublicData } from './hooks/usePublicData';

import Home from './pages/Home';
import About from './pages/About';
import Culture from './pages/Culture';
import Team from './pages/Team';
import Portfolio from './pages/Portfolio';
import PropertyDetail from './pages/PropertyDetail';
import Services from './pages/Services';
import Awards from './pages/Awards';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminPanel from './pages/admin/AdminPanel';
import ScrollToTop from './components/ScrollToTop';

const sharedBootstrapPaths = ['/api/public/site-settings', '/api/public/footer'];

function routeBootstrapPaths(pathname: string) {
  if (pathname === '/') return ['/api/public/home'];
  if (pathname.startsWith('/about')) return ['/api/public/about'];
  if (pathname.startsWith('/services')) return ['/api/public/services'];
  if (pathname.startsWith('/awards')) return ['/api/public/awards'];
  if (pathname.startsWith('/culture')) return ['/api/public/culture'];
  if (pathname.startsWith('/team')) return ['/api/public/team'];
  if (pathname.startsWith('/contact')) return ['/api/public/contact'];
  if (pathname.startsWith('/careers')) return ['/api/public/careers/opportunities'];
  if (pathname.startsWith('/privacy-policy')) return ['/api/public/legal/privacy'];
  if (pathname.startsWith('/terms')) return ['/api/public/legal/terms'];
  if (pathname.startsWith('/portfolio/')) {
    const slug = pathname.split('/').filter(Boolean)[1];
    if (!slug) return ['/api/public/brands', '/api/public/portfolio'];
    let decodedSlug = slug;
    try {
      decodedSlug = decodeURIComponent(slug);
    } catch {
      decodedSlug = slug;
    }
    return ['/api/public/brands', '/api/public/portfolio', `/api/public/portfolio/${decodedSlug}`];
  }
  if (pathname.startsWith('/portfolio')) return ['/api/public/brands', '/api/public/portfolio'];
  return [];
}

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [bootstrapped, setBootstrapped] = useState(false);
  const bootstrapPaths = useMemo(() => {
    const set = new Set<string>([...sharedBootstrapPaths, ...routeBootstrapPaths(location.pathname)]);
    return Array.from(set);
  }, [location.pathname]);
  const isBootLoading = !isAdminRoute && !bootstrapped;

  useEffect(() => {
    if (isAdminRoute || bootstrapped) {
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      await Promise.allSettled(bootstrapPaths.map((path) => prefetchPublicData(path)));
      if (!cancelled) {
        setBootstrapped(true);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, bootstrapPaths, isAdminRoute]);

  if (!isAdminRoute && isBootLoading) {
    return <InitialLoader />;
  }

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

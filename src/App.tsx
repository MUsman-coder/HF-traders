import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import Guidance from './pages/Guidance';
import ScrapStudy from './pages/ScrapStudy';
import BusinessPlans from './pages/BusinessPlans';
import LiveTour from './pages/LiveTour';
import Search from './pages/Search';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Account from './pages/Account';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

/**
 * Sends the visitor back to the homepage on a hard page refresh (F5 / reload
 * button), while leaving normal in-app navigation (clicking links) untouched.
 * Detected via the Navigation Timing API rather than a session flag, so it
 * works the same on every route without extra state to manage.
 *
 * Account and admin pages are excluded — reloading while logged in should
 * keep you right where you are, not bounce you back to the homepage (which
 * looks and feels like being logged out even though the session is intact).
 */
function useRedirectHomeOnRefresh() {
  const location = useLocation();
  const navigate = useNavigate();

  const EXCLUDED_PREFIXES = ['/account', '/admin'];

  useEffect(() => {
    const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const wasReload = entry?.type === 'reload';
    const isExcluded = EXCLUDED_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

    if (wasReload && location.pathname !== '/' && !isExcluded) {
      navigate('/', { replace: true });
    }
    // Only ever needs to run once, right after the app mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Scrolls to the top of the page on normal navigation, but scrolls to the
 * matching element instead when the URL includes a hash (e.g. /#contact) —
 * so links like "Contact Us" actually land on that section.
 */
function useScrollToTopOnNavigate() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Wait a tick for the target page's content to render before scrolling.
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname, location.hash]);
}

const App: React.FC = () => {
  useRedirectHomeOnRefresh();
  useScrollToTopOnNavigate();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/guidance" element={<Guidance />} />
      <Route path="/scrap-study" element={<ScrapStudy />} />
      <Route path="/business-plans" element={<BusinessPlans />} />
      <Route path="/live-tour" element={<LiveTour />} />
      <Route path="/search" element={<Search />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/account" element={<Account />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;

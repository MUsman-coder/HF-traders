import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Home as HomeIcon } from 'lucide-react';
import Logo from './Logo';

interface NavLink {
  label: string;
  to: string;
  icon?: React.ComponentType<{ size?: number }>;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', to: '/', icon: HomeIcon },
  { label: 'Products', to: '/products' },
  { label: 'Guidance', to: '/guidance' },
  { label: 'Scrap Study', to: '/scrap-study' },
  { label: 'Business Plans', to: '/business-plans' },
  { label: 'Live Tour', to: '/live-tour' },
];

interface NavProps {
  /** overlay = transparent, sits on top of the hero image. solid = dark bar for inner pages. */
  variant?: 'overlay' | 'solid';
}

const Nav: React.FC<NavProps> = ({ variant = 'overlay' }) => {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const location = useLocation();
  const isSolid = variant === 'solid';

  useEffect(() => {
    const raw = sessionStorage.getItem('hf_traders_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setFirstName(user.fullName ? String(user.fullName).split(' ')[0] : null);
        setAvatarUrl(user.avatarUrl || null);
      } catch {
        setFirstName(null);
        setAvatarUrl(null);
      }
    } else {
      setFirstName(null);
      setAvatarUrl(null);
    }
  }, [location.pathname]);

  return (
    <nav
      className={
        isSolid
          ? 'sticky top-0 z-[100] flex items-center justify-between p-4 sm:p-5 bg-black/90 backdrop-blur-md border-b border-white/10'
          : 'fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5'
      }
    >
      <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
        <Logo size={36} />
        <span className="text-white text-2xl font-playfair italic">HF Traders</span>
      </Link>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={
              location.pathname === link.to
                ? 'nav-underline flex items-center gap-1.5 text-white px-4 py-1.5 rounded-full text-sm font-medium'
                : 'nav-underline flex items-center gap-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300 px-4 py-1.5 rounded-full text-sm font-medium'
            }
          >
            {link.icon && <link.icon size={14} />}
            {link.label}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-3">
        {firstName ? (
          <Link
            to="/account"
            className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/10 transition-all"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={firstName} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-[#e8702a]/20 flex items-center justify-center">
                <User size={14} className="text-[#e8702a]" />
              </span>
            )}
            {firstName}
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="text-white/85 hover:text-white text-sm font-medium px-4 py-2.5 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/sign-up"
              className="bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      <button
        className="md:hidden text-white"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 mx-4 mt-2 rounded-2xl bg-black/95 backdrop-blur-md border border-white/10 p-4 flex flex-col gap-1 page-transition">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-white/85 hover:text-white hover:bg-white/10 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium"
            >
              {link.icon && <link.icon size={15} />}
              {link.label}
            </Link>
          ))}
          {firstName ? (
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={firstName} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <User size={16} className="text-[#e8702a]" />
              )}
              {firstName}
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-white/85 hover:text-white hover:bg-white/10 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/sign-up"
                onClick={() => setOpen(false)}
                className="mt-2 bg-white text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl text-center"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Nav;

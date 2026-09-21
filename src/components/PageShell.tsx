import React from 'react';
import Nav from './Nav';
import Footer from './Footer';

interface PageShellProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Shared shell for every inner page: solid dark nav, a consistent hero-style
 * page header (eyebrow + Playfair heading), the page content, and the footer.
 * Keeps the same dark theme / accent color / typography as the homepage hero.
 */
const PageShell: React.FC<PageShellProps> = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-black page-transition" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Nav variant="solid" />

      <header className="px-6 sm:px-10 md:px-14 pt-16 pb-14 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <span className="text-[#e8702a] text-xs font-semibold uppercase tracking-[0.15em]">
            {eyebrow}
          </span>
          <h1 className="mt-3 text-white text-4xl sm:text-5xl md:text-6xl leading-[1.05] font-playfair italic">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 text-white/65 text-base sm:text-lg max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      <main className="px-6 sm:px-10 md:px-14 py-14">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      <Footer />
    </div>
  );
};

export default PageShell;

import React from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const NotFound: React.FC = () => {
  return (
    <PageShell eyebrow="404" title="Page not found" subtitle="The page you're looking for doesn't exist or has moved.">
      <Link
        to="/"
        className="inline-block bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95"
      >
        Back to Home
      </Link>
    </PageShell>
  );
};

export default NotFound;

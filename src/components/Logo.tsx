import React from 'react';

interface LogoProps {
  size?: number;
}

/**
 * HF Traders logo mark. Uses the brand's official logo image
 * (public/images/logo-icon.png — a transparent-background crop of the
 * full lockup so it sits cleanly on the site's dark backgrounds).
 */
const Logo: React.FC<LogoProps> = ({ size = 38 }) => {
  return (
    <img
      src="/images/logo-icon.png"
      alt="HF Traders logo"
      style={{ height: size, width: 'auto' }}
      className="shrink-0"
    />
  );
};

export default Logo;

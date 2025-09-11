// This is an example, assuming the original SVG structure. 
// You can replace the path data with your actual loader SVG.
import React from 'react';

const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props} // This allows passing className and other SVG props
  >
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2.5a7.5 7.5 0 0 1 7.5 7.5c0 4.142-3.358 7.5-7.5 7.5-4.142 0-7.5-3.358-7.5-7.5" />
  </svg>
);

export default LoaderIcon;
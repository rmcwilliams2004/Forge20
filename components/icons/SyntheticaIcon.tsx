import React from 'react';

export const SyntheticaIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    {/* Corrected the y-coordinate from 11.12 to 11.11 to make the arc geometrically possible */}
    <path d="M12 11.11 A4.88 4.88 0 1 0 12 1.35" />
    <path d="M15.5 12.5 A3.5 3.5 0 0 0 8.5 12.5" />
  </svg>
);
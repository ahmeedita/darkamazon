import { SVGProps } from 'react';

export function TorLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      className={className}
      fill="currentColor"
      {...props}
    >
      {/* Onion shape with layers */}
      <ellipse cx="32" cy="44" rx="18" ry="12" fill="currentColor" opacity="0.3" />
      <path
        d="M32 8C20 8 16 20 16 28C16 36 20 48 32 56C44 48 48 36 48 28C48 20 44 8 32 8Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M32 12C22 12 19 22 19 28C19 34 22 44 32 51C42 44 45 34 45 28C45 22 42 12 32 12Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M32 16C24 16 22 24 22 28C22 32 24 40 32 46C40 40 42 32 42 28C42 24 40 16 32 16Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M32 20C26 20 25 26 25 28C25 30 26 36 32 41C38 36 39 30 39 28C39 26 38 20 32 20Z"
        fill="currentColor"
        opacity="0.3"
      />
      <circle cx="32" cy="28" r="4" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

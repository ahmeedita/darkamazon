import { SVGProps } from 'react';

export function TorLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      className={className}
      {...props}
    >
      {/* TOR Browser style onion logo */}
      <defs>
        <linearGradient id="torGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7D4698" />
          <stop offset="100%" stopColor="#4E2A84" />
        </linearGradient>
      </defs>
      {/* Outer layer */}
      <path
        d="M32 4C18 4 12 18 12 28C12 40 18 56 32 60C46 56 52 40 52 28C52 18 46 4 32 4Z"
        fill="url(#torGradient)"
      />
      {/* Middle layer */}
      <path
        d="M32 10C20 10 15 22 15 30C15 40 20 52 32 56C44 52 49 40 49 30C49 22 44 10 32 10Z"
        fill="#9B59B6"
        opacity="0.8"
      />
      {/* Inner layer */}
      <path
        d="M32 16C22 16 18 26 18 32C18 40 22 48 32 52C42 48 46 40 46 32C46 26 42 16 32 16Z"
        fill="#A569BD"
        opacity="0.7"
      />
      {/* Core layer */}
      <path
        d="M32 22C25 22 22 30 22 34C22 40 25 44 32 48C39 44 42 40 42 34C42 30 39 22 32 22Z"
        fill="#BB8FCE"
        opacity="0.6"
      />
      {/* Center */}
      <ellipse cx="32" cy="34" rx="6" ry="8" fill="#D2B4DE" opacity="0.8" />
    </svg>
  );
}

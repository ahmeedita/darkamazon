// Brand logos as React components

export const AmazonLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 30" fill="currentColor">
    <path d="M57.4 21.8c-4.8 3.5-11.7 5.4-17.6 5.4-8.3 0-15.8-3.1-21.5-8.2-.4-.4-.1-1 .5-.7 6.1 3.6 13.7 5.7 21.5 5.7 5.3 0 11.1-1.1 16.4-3.4.8-.3 1.5.5.7 1.2z"/>
    <path d="M59.3 19.6c-.6-.8-4-0.4-5.5-.2-.5.1-.6-.4-.1-.7 2.7-1.9 7.2-1.3 7.7-.7.5.6-.1 5-2.7 7.1-.4.3-.8.2-.6-.3.6-1.5 2-4.8 1.2-5.2z"/>
    <path d="M54 3.6V1.2c0-.4.3-.6.6-.6h10.8c.4 0 .6.3.6.6v2.1c0 .3-.3.8-.9 1.5l-5.6 8c2.1-.1 4.3.3 6.2 1.4.4.3.5.6.6 1v2.5c0 .4-.4.8-.8.6-3.4-1.8-8-2-11.7.1-.4.2-.8-.2-.8-.6v-2.4c0-.4 0-1.1.4-1.8l6.5-9.3h-5.6c-.3 0-.5-.2-.5-.6z"/>
    <path d="M18.8 18.6h-3.3c-.3 0-.6-.2-.6-.6V1.3c0-.4.3-.6.7-.6h3.1c.3 0 .6.2.6.6v2.2h.1c.8-2.2 2.4-3.2 4.5-3.2 2.1 0 3.5 1 4.5 3.2.8-2.2 2.7-3.2 4.7-3.2 1.4 0 3 .6 3.9 1.9 1.1 1.5.9 3.7.9 5.6v9.7c0 .4-.3.6-.7.6h-3.3c-.4 0-.6-.3-.6-.6V9.3c0-.8.1-2.6-.1-3.3-.2-1.2-.8-1.5-1.7-1.5-.7 0-1.4.5-1.7 1.2-.3.8-.3 2-.3 3.1v8.6c0 .4-.3.6-.7.6h-3.3c-.4 0-.6-.3-.6-.6V9.3c0-2 .3-4.9-1.8-4.9-2.1 0-2 2.8-2 4.9v8.6c0 .4-.3.6-.7.6z"/>
    <path d="M45.5 0.4c4.9 0 7.6 4.2 7.6 9.6 0 5.2-2.9 9.3-7.6 9.3-4.8 0-7.5-4.2-7.5-9.5 0-5.4 2.7-9.4 7.5-9.4zm0 3.5c-2.5 0-2.6 3.4-2.6 5.5 0 2.1 0 6.5 2.6 6.5 2.5 0 2.7-3.6 2.7-5.7 0-1.4-.1-3.1-.5-4.4-.4-1.1-1.1-1.9-2.2-1.9z"/>
    <path d="M8 18.6H4.6c-.4 0-.6-.3-.6-.6V1.2c0-.3.3-.6.7-.6h3.1c.3 0 .6.2.6.5v2.5h.1C9.3 1.3 10.6.4 12.5.4c1.5 0 3 .6 3.9 2 .8 1.3.8 3.5.8 5.1v10.5c-.1.3-.4.5-.7.5h-3.3c-.3 0-.6-.2-.6-.5V9c0-2 .2-4.8-1.8-4.8-.7 0-1.4.5-1.7 1.2-.4.9-.5 1.8-.5 2.8v9.8c0 .3-.3.6-.6.6z"/>
  </svg>
);

export const TargetLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <circle cx="50" cy="50" r="45" fill="#CC0000"/>
    <circle cx="50" cy="50" r="30" fill="white"/>
    <circle cx="50" cy="50" r="15" fill="#CC0000"/>
  </svg>
);

export const EbayLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 300 120">
    <text x="0" y="90" fontFamily="Arial Black, sans-serif" fontSize="70" fontWeight="bold">
      <tspan fill="#E53238">e</tspan>
      <tspan fill="#0064D2">b</tspan>
      <tspan fill="#F5AF02">a</tspan>
      <tspan fill="#86B817">y</tspan>
    </text>
  </svg>
);

export const PayPalLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 30" fill="none">
    <path d="M38.5 2.3h-7.7c-.5 0-1 .4-1.1.9l-3.1 19.8c-.1.4.2.8.7.8h3.7c.5 0 1-.4 1.1-.9l.8-5.3c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8-2.5 8.8-7.4.4-2.2 0-3.9-.9-5.1-1.1-1.3-3-2-5.9-2zm.9 7.3c-.4 2.8-2.5 2.8-4.5 2.8h-1.1l.8-5.1c0-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.5 1.2.3 2z" fill="#003087"/>
    <path d="M62.5 9.5h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.7-1.6-4.5-1.6-4.2 0-7.8 3.2-8.5 7.6-.4 2.2.1 4.4 1.4 5.8 1.2 1.4 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.4.2.8.7.8h3.3c.5 0 1-.4 1.1-.9l2-12.6c.1-.5-.3-.9-.8-.9zm-5.4 7.4c-.4 2.2-2.1 3.6-4.3 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.2 2.1-3.7 4.3-3.7 1.1 0 1.9.4 2.5 1 .6.7.8 1.7.5 2.8z" fill="#003087"/>
    <path d="M85.2 9.5h-3.7c-.4 0-.7.2-.9.5l-5.2 7.6-2.2-7.3c-.1-.5-.6-.8-1.1-.8h-3.6c-.4 0-.8.4-.6.9l4.1 12.1-3.9 5.5c-.3.4 0 1 .5 1h3.7c.4 0 .7-.2.9-.5l12.5-18.1c.3-.4-.1-.9-.5-.9z" fill="#003087"/>
    <path d="M95.3 2.3h-7.7c-.5 0-1 .4-1.1.9l-3.1 19.8c-.1.4.2.8.7.8h3.9c.4 0 .7-.3.8-.6l.9-5.5c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8-2.5 8.8-7.4.4-2.2 0-3.9-.9-5.1-1.1-1.3-3-2-5.9-2zm.9 7.3c-.4 2.8-2.5 2.8-4.5 2.8h-1.2l.8-5.1c0-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.5 1.2.4 2z" fill="#009CDE"/>
    <path d="M119.3 9.5h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.7-1.6-4.5-1.6-4.2 0-7.8 3.2-8.5 7.6-.4 2.2.1 4.4 1.4 5.8 1.2 1.4 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.4.2.8.7.8h3.3c.5 0 1-.4 1.1-.9l2-12.6c0-.5-.3-.9-.8-.9zm-5.4 7.4c-.4 2.2-2.1 3.6-4.3 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.2 2.1-3.7 4.3-3.7 1.1 0 1.9.4 2.5 1 .6.7.7 1.7.5 2.8z" fill="#009CDE"/>
  </svg>
);

export const WesternUnionLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" fill="none">
    <rect width="120" height="40" rx="4" fill="#FFDC00"/>
    <text x="10" y="28" fontFamily="Arial Black, sans-serif" fontSize="14" fontWeight="bold" fill="#000">
      WU
    </text>
  </svg>
);

export const MoneyGramLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" fill="none">
    <rect width="120" height="40" rx="4" fill="#FF6A00"/>
    <text x="10" y="28" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="white">
      MoneyGram
    </text>
  </svg>
);

export const CashAppLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="8" fill="#00D632"/>
    <path d="M25 14l-2 2-4-4-4 4-2-2 6-6 6 6zm-6 12l-6-6 2-2 4 4 4-4 2 2-6 6z" fill="white"/>
  </svg>
);

export const AppleLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M72.1 55.8c-.1-10.5 8.6-15.6 9-15.8-4.9-7.2-12.5-8.2-15.2-8.3-6.5-.7-12.6 3.8-15.9 3.8-3.3 0-8.3-3.7-13.7-3.6-7 .1-13.5 4.1-17.1 10.4-7.3 12.7-1.9 31.5 5.2 41.8 3.5 5 7.6 10.7 13 10.5 5.2-.2 7.2-3.4 13.5-3.4 6.3 0 8.1 3.4 13.6 3.3 5.6-.1 9.1-5.1 12.6-10.2 4-5.7 5.6-11.3 5.7-11.6-.1-.1-10.9-4.2-11-16.6-.1-10.4 8.5-15.4 8.9-15.7zM62.4 22.4c2.9-3.5 4.8-8.3 4.3-13.2-4.1.2-9.1 2.8-12.1 6.2-2.6 3.1-4.9 8-4.3 12.7 4.6.4 9.3-2.3 12.1-5.7z"/>
  </svg>
);

export const SteamLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="45" fill="#1B2838"/>
    <path d="M50 25c-10 0-18 8-18 18 0 2 .3 4 .9 5.8l17.1 7c1-.3 2-.4 3-.4 5.5 0 10 4.5 10 10s-4.5 10-10 10c-.7 0-1.4-.1-2-.2l-10-14.5c0-.1 0-.2-.1-.3 0-6.6 5.4-12 12-12 1.3 0 2.6.2 3.8.6l8.4-3.5c2.6-1.1 5.5.3 6.6 2.9.5 1.3.6 2.7.2 4.1l6.8-2.8c.5-.2.9-.5 1.2-.9.7-1 .6-2.4-.2-3.3l-8.8-11c-1.7-2.1-4.7-2.4-6.8-.7l-14 11.5c-3.5-3.2-8.1-5.2-13.2-5.2zm3 30c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z" fill="#66C0F4"/>
  </svg>
);

export const WiseLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" fill="none">
    <rect width="120" height="40" rx="4" fill="#00B9FF"/>
    <text x="10" y="28" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="white">
      Wise
    </text>
  </svg>
);

export const NetellerLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" fill="none">
    <rect width="120" height="40" rx="4" fill="#80AF20"/>
    <text x="8" y="28" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="white">
      Neteller
    </text>
  </svg>
);

export const SkrillLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" fill="none">
    <rect width="120" height="40" rx="4" fill="#862165"/>
    <text x="20" y="28" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="white">
      Skrill
    </text>
  </svg>
);

export const BinanceLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 126 126" fill="none">
    <path d="M38.9 53.2 63 29.1l24.1 24.1 14-14L63 1 24.9 39.1l14 14.1zM1 63l14-14 14 14-14 14L1 63zm37.9 9.8L63 96.9l24.1-24.1 14 14L63 125 24.9 86.9l-.1-.1 14.1-14zM97 63l14-14 14 14-14 14-14-14zM77.2 63 63 48.7 52.5 59.2l-1.2 1.2-2.5 2.5v.1L63 77.3 77.2 63.1v-.1z" fill="#F0B90B"/>
  </svg>
);

// Crypto logos
export const BitcoinLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path d="M21.5 13.8c.3-2-1.2-3.1-3.3-3.8l.7-2.8-1.7-.4-.7 2.7c-.4-.1-.9-.2-1.4-.3l.7-2.7-1.7-.4-.7 2.8c-.4-.1-.7-.2-1-.2v-.1l-2.3-.6-.4 1.8s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.1c0 0 .1 0 .2.1h-.2l-1.1 4.4c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.8c.5.1.9.2 1.4.3l-.7 2.8 1.7.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.3 1.9-1 2.1-2.4zm-3.8 5.3c-.5 2-3.9.9-5 .7l.9-3.6c1.1.3 4.6.8 4.1 2.9zm.5-5.3c-.5 1.8-3.3.9-4.2.7l.8-3.2c.9.2 3.9.6 3.4 2.5z" fill="white"/>
  </svg>
);

export const EthereumLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16 4v8.9l7.5 3.3L16 4z" fill="white" fillOpacity="0.6"/>
    <path d="M16 4l-7.5 12.2 7.5-3.3V4z" fill="white"/>
    <path d="M16 21.9v6.1l7.5-10.4-7.5 4.3z" fill="white" fillOpacity="0.6"/>
    <path d="M16 28v-6.1l-7.5-4.3L16 28z" fill="white"/>
    <path d="M16 20.4l7.5-4.2L16 13v7.4z" fill="white" fillOpacity="0.2"/>
    <path d="M8.5 16.2l7.5 4.2V13l-7.5 3.2z" fill="white" fillOpacity="0.6"/>
  </svg>
);

export const TetherLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.9 17.9v-.1c-.1 0-.8.1-2 .1s-1.8-.1-2-.1v.1c-4 .2-7 .9-7 1.8 0 1 3.9 1.8 8.9 1.8s8.9-.8 8.9-1.8c.1-.9-2.9-1.6-6.8-1.8z" fill="white"/>
    <path d="M15.9 16.9c1.3 0 2.4-.1 2.5-.1v-2.4h3.9V11H9.7v3.4h3.9v2.4c.1 0 1.1.1 2.3.1z" fill="white"/>
  </svg>
);

export const LitecoinLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#BFBBBB"/>
    <path d="M11.5 22h10l.5-2h-5.5l1.5-5 2-1-.5 1.5h2l1-3h-2l1.5-5h-3l-2 6.5-2 1 .5-1.5h-2l-1 3h2l-1.5 5.5z" fill="white"/>
  </svg>
);

export const MoneroLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#FF6600"/>
    <path d="M16 6l-8 12v6h4v-4l4-6 4 6v4h4v-6L16 6z" fill="white"/>
  </svg>
);

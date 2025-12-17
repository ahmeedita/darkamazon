import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { BitcoinLogo, EthereumLogo, LitecoinLogo, MoneroLogo } from './BrandLogos';

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  logo: React.ReactNode;
}

const CRYPTO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  LTC: 'litecoin',
  XMR: 'monero',
};

const STORAGE_KEY = 'torbuy_cryptoPrices';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export function CryptoTicker() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      const ids = Object.values(CRYPTO_IDS).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await response.json();

      const cryptoPrices: CryptoPrice[] = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: data.bitcoin?.usd || 0,
          change24h: data.bitcoin?.usd_24h_change || 0,
          logo: <BitcoinLogo className="w-5 h-5" />,
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: data.ethereum?.usd || 0,
          change24h: data.ethereum?.usd_24h_change || 0,
          logo: <EthereumLogo className="w-5 h-5" />,
        },
        {
          symbol: 'LTC',
          name: 'Litecoin',
          price: data.litecoin?.usd || 0,
          change24h: data.litecoin?.usd_24h_change || 0,
          logo: <LitecoinLogo className="w-5 h-5" />,
        },
        {
          symbol: 'XMR',
          name: 'Monero',
          price: data.monero?.usd || 0,
          change24h: data.monero?.usd_24h_change || 0,
          logo: <MoneroLogo className="w-5 h-5" />,
        },
      ];

      setPrices(cryptoPrices);
      
      // Cache the prices with timestamp
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        prices: cryptoPrices.map(p => ({ ...p, logo: undefined })),
        timestamp: Date.now(),
      }));
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for cached prices
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const { prices: cachedPrices, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      if (age < CACHE_DURATION) {
        // Use cached prices and restore logos
        const restoredPrices = cachedPrices.map((p: any) => ({
          ...p,
          logo: p.symbol === 'BTC' ? <BitcoinLogo className="w-5 h-5" /> :
                p.symbol === 'ETH' ? <EthereumLogo className="w-5 h-5" /> :
                p.symbol === 'LTC' ? <LitecoinLogo className="w-5 h-5" /> :
                <MoneroLogo className="w-5 h-5" />,
        }));
        setPrices(restoredPrices);
        setLoading(false);
        
        // Schedule next fetch after remaining cache time
        const timeUntilRefresh = CACHE_DURATION - age;
        const timeout = setTimeout(fetchPrices, timeUntilRefresh);
        return () => clearTimeout(timeout);
      }
    }
    
    // Fetch fresh prices
    fetchPrices();
    
    // Refresh every hour
    const interval = setInterval(fetchPrices, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  if (loading || prices.length === 0) {
    return (
      <div className="bg-card/80 border-t border-border py-2 overflow-hidden">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          Loading crypto prices...
        </div>
      </div>
    );
  }

  // Double the items for seamless infinite scroll
  const tickerItems = [...prices, ...prices, ...prices, ...prices];

  return (
    <div className="bg-card/80 border-t border-border py-2 overflow-hidden">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {tickerItems.map((crypto, index) => (
            <div
              key={`${crypto.symbol}-${index}`}
              className="flex items-center space-x-2 px-6"
            >
              {crypto.logo}
              <span className="font-medium text-foreground text-sm">
                {crypto.symbol}
              </span>
              <span className="text-primary font-semibold text-sm">
                {formatPrice(crypto.price)}
              </span>
              <span
                className={`flex items-center text-xs ${
                  crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {crypto.change24h >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {formatChange(crypto.change24h)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

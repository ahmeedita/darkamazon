import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { GiftCard } from './GiftCard';
import { MoneyTransfer } from './MoneyTransfer';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { getAvailableCards } from '@/lib/cardGenerator';

interface ProductGridProps {
  user: any;
}

// Gift card pricing tiers (same for USD and EUR)
const giftCardTiers = [
  { value: 500, price: 100 },
  { value: 1500, price: 199 },
  { value: 5000, price: 500 },
  { value: 8500, price: 799 },
];

const giftCardBrands = ['Amazon', 'Target', 'eBay', 'Apple', 'Steam'];

// Gift Cards - generated for every brand in both USD and EUR
const giftCardProducts = giftCardBrands.flatMap((brand) =>
  (['USD', 'EUR'] as const).flatMap((currency) =>
    giftCardTiers.map((tier, index) => ({
      id: `gc-${brand.toLowerCase()}-${currency.toLowerCase()}-${index}`,
      brand,
      value: tier.value,
      price: tier.price,
      tier: 'giftcard' as const,
      currency,
    }))
  )
);

// Money transfer pricing tiers (same for USD and EUR)
const transferTiers = [
  { value: 1500, price: 200 },
  { value: 5000, price: 500 },
  { value: 8000, price: 799 },
  { value: 15000, price: 1000 },
];

const transferProviders = ['PayPal', 'Western Union', 'MoneyGram', 'Cash App', 'Wise', 'Neteller', 'Skrill', 'Binance'];

// Money Transfers - generated for every provider in both USD and EUR
const moneyTransferProducts = transferProviders.flatMap((provider) =>
  (['USD', 'EUR'] as const).flatMap((currency) =>
    transferTiers.map((tier, index) => ({
      id: `mt-${provider.toLowerCase().replace(/\s+/g, '-')}-${currency.toLowerCase()}-${index}`,
      provider,
      value: tier.value,
      price: tier.price,
      tier: 'transfer' as const,
      currency,
    }))
  )
);

export function ProductGrid({ user }: ProductGridProps) {
  const [filter, setFilter] = useState<'all' | 'premium' | 'standard' | 'basic' | 'giftcard' | 'transfer'>('all');
  const [availableCards, setAvailableCards] = useState(() => getAvailableCards());

  // Refresh available cards every 5 seconds and on card release events
  useEffect(() => {
    const refreshCards = () => setAvailableCards(getAvailableCards());
    
    const interval = setInterval(refreshCards, 5000);
    window.addEventListener('cardsReleased', refreshCards);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('cardsReleased', refreshCards);
    };
  }, []);

  const sampleProducts = availableCards;

  const filteredProducts = filter === 'all' 
    ? sampleProducts 
    : filter === 'giftcard' || filter === 'transfer'
    ? []
    : sampleProducts.filter(product => product.tier === filter);

  const filteredGiftCards = filter === 'all' || filter === 'giftcard' 
    ? giftCardProducts 
    : [];

  const filteredTransfers = filter === 'all' || filter === 'transfer'
    ? moneyTransferProducts
    : [];

  if (!user) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-card border border-border rounded-2xl p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Premium Access Required
            </h3>
            <p className="text-muted-foreground mb-6">
              Create an account to access our exclusive card marketplace with guaranteed success rates.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Instant delivery</p>
              <p>• 24/7 support via Telegram</p>
              <p>• Verified success rates</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
            Premium Card Collection
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Curated selection of high-quality cards with verified success rates
          </p>
        </div>

        <div className="flex justify-center mb-6 md:mb-8">
          <div className="flex flex-wrap justify-center gap-1 bg-card rounded-lg p-1 border border-border">
            {['all', 'premium', 'standard', 'basic', 'giftcard', 'transfer'].map((filterOption) => (
              <Button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                variant={filter === filterOption ? 'default' : 'ghost'}
                className={`${filter === filterOption ? 'btn-gold' : 'text-muted-foreground hover:text-foreground'} text-xs md:text-sm px-2 md:px-3`}
                size="sm"
              >
                {filterOption === 'giftcard' ? 'Gift Cards' : filterOption === 'transfer' ? 'Transfers' : filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {filteredGiftCards.map((giftCard) => (
            <GiftCard key={giftCard.id} product={giftCard} />
          ))}
          {filteredTransfers.map((transfer) => (
            <MoneyTransfer key={transfer.id} product={transfer} />
          ))}
        </div>

        {filteredProducts.length === 0 && filteredGiftCards.length === 0 && filteredTransfers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found for the selected filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}

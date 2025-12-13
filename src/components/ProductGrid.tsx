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

// Gift Cards - USD
const giftCardProducts = [
  // Amazon USD
  { id: 'gc1', brand: 'Amazon', value: 500, price: 75, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc4', brand: 'Amazon', value: 1000, price: 99.99, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc7', brand: 'Amazon', value: 1500, price: 125, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc10', brand: 'Amazon', value: 2000, price: 150, tier: 'giftcard' as const, currency: 'USD' as const },
  // Amazon EUR
  { id: 'gc-eur1', brand: 'Amazon', value: 500, price: 75, tier: 'giftcard' as const, currency: 'EUR' as const },
  { id: 'gc-eur2', brand: 'Amazon', value: 1000, price: 99.99, tier: 'giftcard' as const, currency: 'EUR' as const },
  { id: 'gc-eur3', brand: 'Amazon', value: 1500, price: 125, tier: 'giftcard' as const, currency: 'EUR' as const },
  { id: 'gc-eur4', brand: 'Amazon', value: 2000, price: 150, tier: 'giftcard' as const, currency: 'EUR' as const },
  // Target USD
  { id: 'gc2', brand: 'Target', value: 500, price: 75, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc5', brand: 'Target', value: 1000, price: 99.99, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc8', brand: 'Target', value: 1500, price: 125, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc11', brand: 'Target', value: 2000, price: 150, tier: 'giftcard' as const, currency: 'USD' as const },
  // eBay USD
  { id: 'gc3', brand: 'eBay', value: 500, price: 75, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc6', brand: 'eBay', value: 1000, price: 99.99, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc9', brand: 'eBay', value: 1500, price: 125, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc12', brand: 'eBay', value: 2000, price: 150, tier: 'giftcard' as const, currency: 'USD' as const },
  // Apple USD
  { id: 'gc-apple1', brand: 'Apple', value: 500, price: 75, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc-apple2', brand: 'Apple', value: 1000, price: 99.99, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc-apple3', brand: 'Apple', value: 1500, price: 125, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc-apple4', brand: 'Apple', value: 2000, price: 150, tier: 'giftcard' as const, currency: 'USD' as const },
  // Apple EUR
  { id: 'gc-apple-eur1', brand: 'Apple', value: 500, price: 75, tier: 'giftcard' as const, currency: 'EUR' as const },
  { id: 'gc-apple-eur2', brand: 'Apple', value: 1000, price: 99.99, tier: 'giftcard' as const, currency: 'EUR' as const },
  { id: 'gc-apple-eur3', brand: 'Apple', value: 1500, price: 125, tier: 'giftcard' as const, currency: 'EUR' as const },
  { id: 'gc-apple-eur4', brand: 'Apple', value: 2000, price: 150, tier: 'giftcard' as const, currency: 'EUR' as const },
  // Steam USD
  { id: 'gc-steam1', brand: 'Steam', value: 500, price: 75, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc-steam2', brand: 'Steam', value: 1000, price: 99.99, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc-steam3', brand: 'Steam', value: 1500, price: 125, tier: 'giftcard' as const, currency: 'USD' as const },
  { id: 'gc-steam4', brand: 'Steam', value: 2000, price: 150, tier: 'giftcard' as const, currency: 'USD' as const },
  // Steam EUR
  { id: 'gc-steam-eur1', brand: 'Steam', value: 500, price: 75, tier: 'giftcard' as const, currency: 'EUR' as const },
  { id: 'gc-steam-eur2', brand: 'Steam', value: 1000, price: 99.99, tier: 'giftcard' as const, currency: 'EUR' as const },
  { id: 'gc-steam-eur3', brand: 'Steam', value: 1500, price: 125, tier: 'giftcard' as const, currency: 'EUR' as const },
  { id: 'gc-steam-eur4', brand: 'Steam', value: 2000, price: 150, tier: 'giftcard' as const, currency: 'EUR' as const },
];

// Money Transfers
const moneyTransferProducts = [
  // PayPal USD
  { id: 'mt1', provider: 'PayPal', value: 500, price: 70, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt5', provider: 'PayPal', value: 1500, price: 140, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt9', provider: 'PayPal', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'USD' as const },
  // PayPal EUR
  { id: 'mt-paypal-eur1', provider: 'PayPal', value: 500, price: 70, tier: 'transfer' as const, currency: 'EUR' as const },
  { id: 'mt-paypal-eur2', provider: 'PayPal', value: 1500, price: 140, tier: 'transfer' as const, currency: 'EUR' as const },
  { id: 'mt-paypal-eur3', provider: 'PayPal', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'EUR' as const },
  // Western Union USD
  { id: 'mt2', provider: 'Western Union', value: 500, price: 70, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt6', provider: 'Western Union', value: 1500, price: 140, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt10', provider: 'Western Union', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'USD' as const },
  // MoneyGram USD
  { id: 'mt3', provider: 'MoneyGram', value: 500, price: 70, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt7', provider: 'MoneyGram', value: 1500, price: 140, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt11', provider: 'MoneyGram', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'USD' as const },
  // Cash App USD
  { id: 'mt4', provider: 'Cash App', value: 500, price: 70, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt8', provider: 'Cash App', value: 1500, price: 140, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt12', provider: 'Cash App', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'USD' as const },
  // Wise USD
  { id: 'mt-wise1', provider: 'Wise', value: 500, price: 70, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt-wise2', provider: 'Wise', value: 1500, price: 140, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt-wise3', provider: 'Wise', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'USD' as const },
  // Wise EUR
  { id: 'mt-wise-eur1', provider: 'Wise', value: 500, price: 70, tier: 'transfer' as const, currency: 'EUR' as const },
  { id: 'mt-wise-eur2', provider: 'Wise', value: 1500, price: 140, tier: 'transfer' as const, currency: 'EUR' as const },
  { id: 'mt-wise-eur3', provider: 'Wise', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'EUR' as const },
  // Neteller USD
  { id: 'mt-neteller1', provider: 'Neteller', value: 500, price: 70, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt-neteller2', provider: 'Neteller', value: 1500, price: 140, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt-neteller3', provider: 'Neteller', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'USD' as const },
  // Neteller EUR
  { id: 'mt-neteller-eur1', provider: 'Neteller', value: 500, price: 70, tier: 'transfer' as const, currency: 'EUR' as const },
  { id: 'mt-neteller-eur2', provider: 'Neteller', value: 1500, price: 140, tier: 'transfer' as const, currency: 'EUR' as const },
  { id: 'mt-neteller-eur3', provider: 'Neteller', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'EUR' as const },
  // Skrill USD
  { id: 'mt-skrill1', provider: 'Skrill', value: 500, price: 70, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt-skrill2', provider: 'Skrill', value: 1500, price: 140, tier: 'transfer' as const, currency: 'USD' as const },
  { id: 'mt-skrill3', provider: 'Skrill', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'USD' as const },
  // Skrill EUR
  { id: 'mt-skrill-eur1', provider: 'Skrill', value: 500, price: 70, tier: 'transfer' as const, currency: 'EUR' as const },
  { id: 'mt-skrill-eur2', provider: 'Skrill', value: 1500, price: 140, tier: 'transfer' as const, currency: 'EUR' as const },
  { id: 'mt-skrill-eur3', provider: 'Skrill', value: 2500, price: 199.99, tier: 'transfer' as const, currency: 'EUR' as const },
];

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

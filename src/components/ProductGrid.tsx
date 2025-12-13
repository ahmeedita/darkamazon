import { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { GiftCard } from './GiftCard';
import { MoneyTransfer } from './MoneyTransfer';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { generateDailyCards } from '@/lib/cardGenerator';

interface ProductGridProps {
  user: any;
}

// Gift Cards
const giftCardProducts = [
  // $500 Gift Cards for $40
  { id: 'gc1', brand: 'Amazon', value: 500, price: 40, tier: 'giftcard' as const },
  { id: 'gc2', brand: 'Target', value: 500, price: 40, tier: 'giftcard' as const },
  { id: 'gc3', brand: 'eBay', value: 500, price: 40, tier: 'giftcard' as const },
  // $1000 Gift Cards for $60
  { id: 'gc4', brand: 'Amazon', value: 1000, price: 60, tier: 'giftcard' as const },
  { id: 'gc5', brand: 'Target', value: 1000, price: 60, tier: 'giftcard' as const },
  { id: 'gc6', brand: 'eBay', value: 1000, price: 60, tier: 'giftcard' as const },
  // $1500 Gift Cards for $79.99
  { id: 'gc7', brand: 'Amazon', value: 1500, price: 79.99, tier: 'giftcard' as const },
  { id: 'gc8', brand: 'Target', value: 1500, price: 79.99, tier: 'giftcard' as const },
  { id: 'gc9', brand: 'eBay', value: 1500, price: 79.99, tier: 'giftcard' as const },
  // $2000 Gift Cards for $90
  { id: 'gc10', brand: 'Amazon', value: 2000, price: 90, tier: 'giftcard' as const },
  { id: 'gc11', brand: 'Target', value: 2000, price: 90, tier: 'giftcard' as const },
  { id: 'gc12', brand: 'eBay', value: 2000, price: 90, tier: 'giftcard' as const },
];

// Money Transfers
const moneyTransferProducts = [
  // $500 transfers for $70
  { id: 'mt1', provider: 'PayPal', value: 500, price: 70, tier: 'transfer' as const },
  { id: 'mt2', provider: 'Western Union', value: 500, price: 70, tier: 'transfer' as const },
  { id: 'mt3', provider: 'MoneyGram', value: 500, price: 70, tier: 'transfer' as const },
  { id: 'mt4', provider: 'Cash App', value: 500, price: 70, tier: 'transfer' as const },
  // $2500 transfers for $120
  { id: 'mt5', provider: 'PayPal', value: 2500, price: 120, tier: 'transfer' as const },
  { id: 'mt6', provider: 'Western Union', value: 2500, price: 120, tier: 'transfer' as const },
  { id: 'mt7', provider: 'MoneyGram', value: 2500, price: 120, tier: 'transfer' as const },
  { id: 'mt8', provider: 'Cash App', value: 2500, price: 120, tier: 'transfer' as const },
];

export function ProductGrid({ user }: ProductGridProps) {
  const [filter, setFilter] = useState<'all' | 'premium' | 'standard' | 'basic' | 'giftcard' | 'transfer'>('all');

  // Generate cards once per day using memoization
  const sampleProducts = useMemo(() => generateDailyCards(), []);

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

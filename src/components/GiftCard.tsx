import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, DollarSign, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { AmazonLogo, TargetLogo, EbayLogo } from './BrandLogos';

interface GiftCardProps {
  product: {
    id: string;
    brand: string;
    value: number;
    price: number;
    tier: 'giftcard';
  };
}

export function GiftCard({ product }: GiftCardProps) {
  const { addItem } = useCart();

  const getBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'amazon': return 'text-orange-500';
      case 'target': return 'text-red-500';
      case 'ebay': return 'text-blue-500';
      default: return 'text-primary';
    }
  };

  const getBrandLogo = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'amazon': return <AmazonLogo className="w-20 h-10 md:w-24 md:h-12 text-orange-500" />;
      case 'target': return <TargetLogo className="w-12 h-12 md:w-16 md:h-16" />;
      case 'ebay': return <EbayLogo className="w-20 h-10 md:w-24 md:h-12" />;
      default: return null;
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      type: 'giftcard',
      name: `${product.brand} Gift Card`,
      price: product.price,
      details: `Value: $${product.value}`,
    });
    toast.success('Added to cart!');
  };

  return (
    <Card className="card-premium p-4 md:p-6 space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gift className={`w-4 h-4 md:w-5 md:h-5 ${getBrandColor(product.brand)}`} />
          <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 text-xs">
            Gift Card
          </Badge>
        </div>
        <span className="font-display text-lg md:text-xl font-bold text-primary">
          ${product.price}
        </span>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div className="text-center py-4 md:py-6 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center mb-2 md:mb-3">
            {getBrandLogo(product.brand)}
          </div>
          <h3 className="font-display text-lg md:text-2xl font-bold text-foreground mb-1">
            {product.brand}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">Gift Card</p>
        </div>

        <div className="flex items-center justify-between bg-muted/20 p-3 md:p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-xs md:text-sm text-muted-foreground">Card Value:</span>
          </div>
          <span className="font-display text-xl md:text-2xl font-bold text-green-500">
            ${product.value}
          </span>
        </div>

        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            You pay only <span className="text-primary font-bold">${product.price}</span> for a <span className="text-green-500 font-bold">${product.value}</span> gift card
          </p>
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        className="w-full btn-gold text-sm md:text-lg py-2 md:py-3"
      >
        <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
        Add to Cart
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Instant delivery after checkout
      </p>
    </Card>
  );
}

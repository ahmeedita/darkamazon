import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, DollarSign, Store } from 'lucide-react';

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
  const getBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'amazon': return 'text-orange-500';
      case 'target': return 'text-red-500';
      case 'ebay': return 'text-blue-500';
      default: return 'text-primary';
    }
  };

  const handlePayPal = () => {
    const paypalUrl = `https://www.paypal.com/paypalme/please62ha/${product.price}`;
    window.open(paypalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="card-premium p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gift className={`w-5 h-5 ${getBrandColor(product.brand)}`} />
          <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30">
            Gift Card
          </Badge>
        </div>
        <span className="font-display text-xl font-bold text-primary">
          ${product.price}
        </span>
      </div>

      <div className="space-y-4">
        <div className="text-center py-6 bg-muted/30 rounded-lg">
          <Store className={`w-12 h-12 mx-auto mb-3 ${getBrandColor(product.brand)}`} />
          <h3 className="font-display text-2xl font-bold text-foreground mb-1">
            {product.brand}
          </h3>
          <p className="text-muted-foreground">Gift Card</p>
        </div>

        <div className="flex items-center justify-between bg-muted/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">Card Value:</span>
          </div>
          <span className="font-display text-2xl font-bold text-green-500">
            ${product.value}
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            You pay only <span className="text-primary font-bold">${product.price}</span> for a <span className="text-green-500 font-bold">${product.value}</span> gift card
          </p>
        </div>
      </div>

      <Button
        onClick={handlePayPal}
        className="w-full btn-gold text-lg py-3"
      >
        Purchase via PayPal
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Payment to @please62ha • Instant delivery
      </p>
    </Card>
  );
}

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Banknote, DollarSign, ShoppingCart, Euro } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { PayPalLogo, WesternUnionLogo, MoneyGramLogo, CashAppLogo, WiseLogo, NetellerLogo, SkrillLogo, BinanceLogo } from './BrandLogos';

interface MoneyTransferProps {
  product: {
    id: string;
    provider: string;
    value: number;
    price: number;
    tier: 'transfer';
    currency?: 'USD' | 'EUR';
  };
}

export function MoneyTransfer({ product }: MoneyTransferProps) {
  const { addItem } = useCart();
  const currency = product.currency || 'USD';
  const currencySymbol = currency === 'EUR' ? '€' : '$';

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'paypal': return 'text-blue-500';
      case 'western union': return 'text-yellow-500';
      case 'moneygram': return 'text-red-500';
      case 'cash app': return 'text-green-500';
      case 'wise': return 'text-[#00B9FF]';
      case 'neteller': return 'text-[#80AF20]';
      case 'skrill': return 'text-[#862165]';
      case 'binance': return 'text-[#F0B90B]';
      default: return 'text-primary';
    }
  };

  const getProviderBg = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'paypal': return 'bg-blue-500/10';
      case 'western union': return 'bg-yellow-500/10';
      case 'moneygram': return 'bg-orange-500/10';
      case 'cash app': return 'bg-green-500/10';
      case 'wise': return 'bg-[#00B9FF]/10';
      case 'neteller': return 'bg-[#80AF20]/10';
      case 'skrill': return 'bg-[#862165]/10';
      case 'binance': return 'bg-[#F0B90B]/10';
      default: return 'bg-primary/10';
    }
  };

  const getProviderLogo = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'paypal': return <PayPalLogo className="w-24 h-10 md:w-32 md:h-12" />;
      case 'western union': return <WesternUnionLogo className="w-20 h-10 md:w-24 md:h-12" />;
      case 'moneygram': return <MoneyGramLogo className="w-24 h-10 md:w-28 md:h-12" />;
      case 'cash app': return <CashAppLogo className="w-10 h-10 md:w-12 md:h-12" />;
      case 'wise': return <WiseLogo className="w-20 h-10 md:w-24 md:h-12" />;
      case 'neteller': return <NetellerLogo className="w-24 h-10 md:w-28 md:h-12" />;
      case 'skrill': return <SkrillLogo className="w-20 h-10 md:w-24 md:h-12" />;
      case 'binance': return <BinanceLogo className="w-10 h-10 md:w-12 md:h-12" />;
      default: return null;
    }
  };

  const handleAddToCart = () => {
    // Generate unique ID for each transfer instance to allow duplicates
    const uniqueId = `transfer-${product.id}-${Date.now()}`;
    addItem({
      id: uniqueId,
      type: 'transfer',
      name: `${product.provider} Transfer (${currency})`,
      price: product.price,
      details: `Value: ${currencySymbol}${product.value}`,
    });
    toast.success('Added to cart!');
  };

  const CurrencyIcon = currency === 'EUR' ? Euro : DollarSign;

  return (
    <Card className="card-premium p-4 md:p-6 space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Banknote className={`w-4 h-4 md:w-5 md:h-5 ${getProviderColor(product.provider)}`} />
          <span className="text-sm font-medium text-muted-foreground">Transfer</span>
          <Badge variant="outline" className="text-xs">
            {currency}
          </Badge>
        </div>
        <span className="font-display text-lg md:text-xl font-bold text-primary">
          {currencySymbol}{product.price}
        </span>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div className={`text-center py-4 md:py-6 ${getProviderBg(product.provider)} rounded-lg`}>
          <div className="flex items-center justify-center mb-2 md:mb-3">
            {getProviderLogo(product.provider)}
          </div>
          <h3 className="font-display text-lg md:text-2xl font-bold text-foreground mb-1">
            {product.provider}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">Money Transfer ({currency})</p>
        </div>

        <div className="flex items-center justify-between bg-muted/20 p-3 md:p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <CurrencyIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-xs md:text-sm text-muted-foreground">Transfer Value:</span>
          </div>
          <span className="font-display text-xl md:text-2xl font-bold text-green-500">
            {currencySymbol}{product.value}
          </span>
        </div>

        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            You pay only <span className="text-primary font-bold">{currencySymbol}{product.price}</span> for a <span className="text-green-500 font-bold">{currencySymbol}{product.value}</span> transfer
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
        Processed within 24 hours
      </p>
    </Card>
  );
}

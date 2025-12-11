import { Crown, MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BitcoinLogo, EthereumLogo, LitecoinLogo, MoneroLogo } from './BrandLogos';

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic could go here
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-primary">
                  DARK AMAZON
                </h3>
                <p className="text-xs text-muted-foreground">Premium Marketplace</p>
              </div>
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md">
              Your trusted source for premium card marketplace services with guaranteed success rates and instant delivery.
            </p>
            <div className="space-y-2">
              <a
                href="https://t.me/Chopcityzcc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors text-sm md:text-base"
              >
                <MessageCircle className="w-4 h-4" />
                <span>@Chopcityzcc on Telegram</span>
              </a>
              <p className="text-xs md:text-sm text-muted-foreground">24/7 Support Available</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="https://t.me/Chopcityzcc" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm md:text-base">Stay Updated</h4>
            <p className="text-muted-foreground text-xs md:text-sm mb-4">
              Get notified about new premium cards and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="input-premium text-sm"
                required
              />
              <Button type="submit" className="w-full btn-gold text-sm" size="sm">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Crypto Payment Section */}
        <div className="border-t border-border mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="text-center mb-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-3">Accepted Cryptocurrency Payments</p>
            <div className="flex items-center justify-center space-x-4 md:space-x-6">
              <div className="flex flex-col items-center space-y-1">
                <BitcoinLogo className="w-8 h-8 md:w-10 md:h-10" />
                <span className="text-xs text-muted-foreground">BTC</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <EthereumLogo className="w-8 h-8 md:w-10 md:h-10" />
                <span className="text-xs text-muted-foreground">ETH</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <LitecoinLogo className="w-8 h-8 md:w-10 md:h-10" />
                <span className="text-xs text-muted-foreground">LTC</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <MoneroLogo className="w-8 h-8 md:w-10 md:h-10" />
                <span className="text-xs text-muted-foreground">XMR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-6 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure Crypto Payment</span>
              </div>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              © 2024 DARK AMAZON. Premium Marketplace.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

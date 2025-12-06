import { Crown, MessageCircle, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic could go here
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-display text-2xl font-bold text-primary">
                  ChopCityzCC
                </h3>
                <p className="text-xs text-muted-foreground">Premium Marketplace</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your trusted source for premium card marketplace services with guaranteed success rates and instant delivery.
            </p>
            <div className="space-y-2">
              <a
                href="https://t.me/Chopcityzcc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>@Chopcityzcc on Telegram</span>
              </a>
              <p className="text-sm text-muted-foreground">24/7 Support Available</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#products" className="text-muted-foreground hover:text-primary transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="https://t.me/Chopcityzcc" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Stay Updated</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Get notified about new premium cards and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="input-premium"
                required
              />
              <Button type="submit" className="w-full btn-gold" size="sm">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure Payment via PayPal</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Payment to: @please62ha
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 ChopCityzCC. Premium Marketplace.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { Button } from '@/components/ui/button';
import { Crown, Shield, Zap, MessageCircle } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary/20 rounded-full">
              <Crown className="w-16 h-16 text-primary" />
            </div>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6">
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              DARK AMAZON
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
            Premium card marketplace with guaranteed success rates and instant delivery
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={onGetStarted}
              className="btn-gold text-lg px-8 py-4"
            >
              Get Premium Access
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-secondary text-lg px-8 py-4"
              onClick={() => window.open('https://t.me/Chopcityzcc', '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              24/7 Support
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-success-high/20 rounded-lg mb-4">
                <Shield className="w-8 h-8 text-success-high" />
              </div>
              <h3 className="font-bold text-foreground mb-2">80% Success Rate</h3>
              <p className="text-muted-foreground text-sm">Premium tier guaranteed performance</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-primary/20 rounded-lg mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Instant Delivery</h3>
              <p className="text-muted-foreground text-sm">Immediate access after payment</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-accent/20 rounded-lg mb-4">
                <MessageCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-foreground mb-2">24/7 Support</h3>
              <p className="text-muted-foreground text-sm">Telegram support always available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
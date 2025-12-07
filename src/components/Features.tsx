import { Shield, Zap, Clock, MessageCircle, CreditCard, Users } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Shield,
      title: 'Verified Success Rates',
      description: 'All cards are tested and verified with transparent success rate guarantees',
      color: 'text-success-high',
      bgColor: 'bg-success-high/20',
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Receive your card details immediately after successful PayPal payment',
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      icon: CreditCard,
      title: 'Premium Quality',
      description: 'Curated selection of high-balance cards from trusted international banks',
      color: 'text-accent',
      bgColor: 'bg-accent/20',
    },
    {
      icon: MessageCircle,
      title: '24/7 Support',
      description: 'Round-the-clock customer support via our dedicated Telegram channel',
      color: 'text-success-medium',
      bgColor: 'bg-success-medium/20',
    },
    {
      icon: Clock,
      title: 'Regular Updates',
      description: 'Fresh inventory updated daily with new high-quality card options',
      color: 'text-success-low',
      bgColor: 'bg-success-low/20',
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Join thousands of satisfied customers in our premium marketplace',
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
  ];

  return (
    <section id="features" className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            Why Choose DARK AMAZON?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the difference with our premium marketplace features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-premium p-6 text-center group"
            >
              <div className={`inline-flex p-4 ${feature.bgColor} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="card-premium p-8 max-w-3xl mx-auto">
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Three Success Rate Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-success-high mb-2">80%</div>
                <div className="font-semibold text-foreground mb-1">Premium Tier</div>
                <div className="text-success-high font-bold">£13</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success-medium mb-2">50%</div>
                <div className="font-semibold text-foreground mb-1">Standard Tier</div>
                <div className="text-success-medium font-bold">£10</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success-low mb-2">30%</div>
                <div className="font-semibold text-foreground mb-1">Basic Tier</div>
                <div className="text-success-low font-bold">£7</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { CryptoTicker } from '@/components/CryptoTicker';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { profile, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (!profile) {
      setAuthModalOpen(true);
    } else {
      // Scroll to products section
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner-gold w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <Hero onGetStarted={handleGetStarted} />
        <ProductGrid user={profile} />
        <Features />
      </main>

      <Footer />
      <CryptoTicker />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default Index;

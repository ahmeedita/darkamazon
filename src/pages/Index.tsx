import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { CryptoTicker } from '@/components/CryptoTicker';
import { AuthModal } from '@/components/AuthModal';

const Index = () => {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check for existing user session
    const currentUser = localStorage.getItem('chopcityzcc_currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('chopcityzcc_currentUser');
    setUser(null);
  };

  const handleGetStarted = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      // Scroll to products section
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      <main className="pt-20">
        <Hero onGetStarted={handleGetStarted} />
        <ProductGrid user={user} />
        <Features />
      </main>

      <Footer />
      <CryptoTicker />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleLogin}
      />
    </div>
  );
};

export default Index;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, LogOut, User, MessageCircle, Package, Menu, X } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { Cart } from './Cart';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Crown className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <div>
                <h1 className="font-display text-lg md:text-2xl font-bold text-primary">
                  DARK AMAZON
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Premium Marketplace</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#products" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
                Products
              </a>
              <a href="#features" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
                Features
              </a>
              <Link to="/orders" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors font-medium text-sm">
                <Package className="w-4 h-4" />
                <span>Orders</span>
              </Link>
              <a href="https://t.me/Darkamazoncc" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors font-medium text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>Support</span>
              </a>
            </nav>

            <div className="flex items-center space-x-2 md:space-x-4">
              {profile && <Cart />}
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-foreground"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Desktop user section */}
              <div className="hidden md:flex items-center">
                {profile ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-card px-3 py-2 rounded-lg">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-foreground font-medium text-sm">{profile.username}</span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-secondary"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setAuthModalOpen(true)}
                    className="btn-gold text-sm"
                    size="sm"
                  >
                    Premium Access
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <a 
                  href="#products" 
                  className="text-foreground hover:text-primary transition-colors font-medium text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </a>
                <a 
                  href="#features" 
                  className="text-foreground hover:text-primary transition-colors font-medium text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <Link 
                  to="/orders" 
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors font-medium text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-4 h-4" />
                  <span>Orders</span>
                </Link>
                <a 
                  href="https://t.me/Darkamazoncc"
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors font-medium text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Support</span>
                </a>
              </nav>
              
              {profile ? (
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium text-sm">{profile.username}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-secondary text-xs"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="btn-gold text-sm w-full"
                  size="sm"
                >
                  Premium Access
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </>
  );
}

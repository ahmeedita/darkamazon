import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, LogOut, User, MessageCircle, Package } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { Cart } from './Cart';

interface HeaderProps {
  user: any;
  onLogin: (user: any) => void;
  onLogout: () => void;
}

export function Header({ user, onLogin, onLogout }: HeaderProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-8 h-8 text-primary" />
              <div>
              <h1 className="font-display text-2xl font-bold text-primary">
                  DARK AMAZON
                </h1>
                <p className="text-xs text-muted-foreground">Premium Marketplace</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#products" className="text-foreground hover:text-primary transition-colors font-medium">
                Products
              </a>
              <a href="#features" className="text-foreground hover:text-primary transition-colors font-medium">
                Features
              </a>
              <Link to="/orders" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors font-medium">
                <Package className="w-4 h-4" />
                <span>Orders</span>
              </Link>
              <a href="https://t.me/Chopcityzcc" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors font-medium">
                <MessageCircle className="w-4 h-4" />
                <span>Support</span>
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {user && <Cart />}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-card px-3 py-2 rounded-lg">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium">{user.username}</span>
                  </div>
                  <Button
                    onClick={onLogout}
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
                  className="btn-gold"
                >
                  Premium Access
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={onLogin}
      />
    </>
  );
}
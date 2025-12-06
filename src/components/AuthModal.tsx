import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const users = JSON.parse(localStorage.getItem('chopcityzcc_users') || '[]');
        const user = users.find((u: any) => 
          u.email === formData.email && u.password === formData.password
        );

        if (user) {
          localStorage.setItem('chopcityzcc_currentUser', JSON.stringify(user));
          onSuccess(user);
          toast({
            title: 'Welcome back!',
            description: 'Successfully logged in to ChopCityzCC',
          });
          onClose();
        } else {
          toast({
            title: 'Invalid credentials',
            description: 'Please check your email and password',
            variant: 'destructive',
          });
        }
      } else {
        // Signup logic
        const users = JSON.parse(localStorage.getItem('chopcityzcc_users') || '[]');
        const existingUser = users.find((u: any) => u.email === formData.email);

        if (existingUser) {
          toast({
            title: 'Email already exists',
            description: 'Please use a different email or try logging in',
            variant: 'destructive',
          });
        } else {
          const newUser = {
            id: Date.now().toString(),
            email: formData.email,
            username: formData.username,
            password: formData.password,
            createdAt: new Date().toISOString(),
          };

          users.push(newUser);
          localStorage.setItem('chopcityzcc_users', JSON.stringify(users));
          localStorage.setItem('chopcityzcc_currentUser', JSON.stringify(newUser));
          
          onSuccess(newUser);
          toast({
            title: 'Account created!',
            description: 'Welcome to ChopCityzCC premium marketplace',
          });
          onClose();
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl text-foreground">
            {isLogin ? 'Welcome Back' : 'Join ChopCityzCC'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 input-premium"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-10 input-premium"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 input-premium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-gold text-lg py-6"
          >
            {loading ? (
              <div className="spinner-gold" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-accent transition-colors font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
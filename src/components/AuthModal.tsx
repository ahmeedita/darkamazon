import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup';

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!formData.username.trim()) {
          toast({
            title: 'Username required',
            description: 'Please enter your username',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const result = await signIn(formData.username, formData.password);
        if (result.error) {
          toast({
            title: 'Login failed',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'Successfully logged in to DARK AMAZON',
          });
          onSuccess();
          onClose();
          resetForm();
        }
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: 'Passwords do not match',
            description: 'Please make sure both passwords are the same',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: 'Password too short',
            description: 'Password must be at least 6 characters',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        if (!formData.username.trim()) {
          toast({
            title: 'Username required',
            description: 'Please enter a username',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const result = await signUp(formData.username, formData.password);
        if (result.error) {
          toast({
            title: 'Registration failed',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to DARK AMAZON premium marketplace',
          });
          onSuccess();
          onClose();
          resetForm();
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

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-xs text-amber-200 text-center">
          ⚠️ Accounts inactive for 7 days are automatically deleted
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-foreground font-medium">
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="pl-10 input-premium"
              required
            />
          </div>
        </div>

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
        {loading ? <div className="spinner-gold" /> : 'Sign In'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => handleModeChange('signup')}
          className="text-primary hover:text-accent transition-colors font-medium text-sm"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-xs text-amber-200 text-center">
          ⚠️ Accounts inactive for 7 days are automatically deleted
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-username" className="text-foreground font-medium">
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="signup-username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="pl-10 input-premium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-foreground font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 pr-10 input-premium"
              required
              minLength={6}
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

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-foreground font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="pl-10 input-premium"
              required
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full btn-gold text-lg py-6"
      >
        {loading ? <div className="spinner-gold" /> : 'Create Account'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => handleModeChange('login')}
          className="text-primary hover:text-accent transition-colors font-medium text-sm"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join DARK AMAZON';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl text-foreground">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        {mode === 'login' && renderLoginForm()}
        {mode === 'signup' && renderSignupForm()}
      </DialogContent>
    </Dialog>
  );
}

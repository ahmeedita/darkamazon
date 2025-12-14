import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User, Eye, EyeOff, KeyRound, AlertTriangle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { registerUser, loginUser, recoverAccount, UserProfile } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

type AuthMode = 'login' | 'signup' | 'recover' | 'showPhrase';

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    backupPhrase: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [generatedPhrase, setGeneratedPhrase] = useState('');
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      backupPhrase: '',
      newPassword: '',
    });
    setGeneratedPhrase('');
    setPendingUser(null);
    setCopied(false);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleCopyPhrase = async () => {
    await navigator.clipboard.writeText(generatedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPhrase = () => {
    if (pendingUser) {
      localStorage.setItem('darkAmazon_currentUser', JSON.stringify(pendingUser));
      window.dispatchEvent(new Event('userChanged'));
      onSuccess(pendingUser);
      toast({
        title: 'Account created!',
        description: 'Welcome to DARK AMAZON premium marketplace',
      });
      onClose();
      resetForm();
      setMode('login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await loginUser(formData.username, formData.password);
        if ('error' in result) {
          toast({
            title: 'Login failed',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          localStorage.setItem('darkAmazon_currentUser', JSON.stringify(result.user));
          window.dispatchEvent(new Event('userChanged'));
          onSuccess(result.user);
          toast({
            title: 'Welcome back!',
            description: 'Successfully logged in to DARK AMAZON',
          });
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

        const result = await registerUser(formData.username, formData.password);
        if ('error' in result) {
          toast({
            title: 'Registration failed',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          setGeneratedPhrase(result.backupPhrase);
          setPendingUser(result.user);
          setMode('showPhrase');
        }
      } else if (mode === 'recover') {
        if (formData.newPassword.length < 6) {
          toast({
            title: 'Password too short',
            description: 'Password must be at least 6 characters',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const result = await recoverAccount(formData.backupPhrase, formData.newPassword);
        if ('error' in result) {
          toast({
            title: 'Recovery failed',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          localStorage.setItem('darkAmazon_currentUser', JSON.stringify(result.user));
          window.dispatchEvent(new Event('userChanged'));
          onSuccess(result.user);
          toast({
            title: 'Account recovered!',
            description: 'Your password has been reset successfully',
          });
          onClose();
          resetForm();
          setMode('login');
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

  const renderShowPhrase = () => (
    <div className="space-y-6 mt-6">
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">Save your recovery phrase!</p>
            <p className="text-xs text-muted-foreground">
              This is the ONLY way to recover your account if you forget your password or username. 
              Write it down and keep it safe. We cannot recover your account without it.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-foreground">Your Recovery Phrase</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyPhrase}
            className="text-xs"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 bg-secondary/50 rounded-lg">
          {generatedPhrase.split(' ').map((word, index) => (
            <div key={index} className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground text-xs">{index + 1}.</span>
              <span className="text-foreground font-mono">{word}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-xs text-amber-200 text-center">
          ⚠️ Inactive accounts are automatically deleted after 7 days. Stay active to keep your account!
        </p>
      </div>

      <Button
        onClick={handleConfirmPhrase}
        className="w-full btn-gold text-lg py-6"
      >
        I've Saved My Phrase - Continue
      </Button>
    </div>
  );

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

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => handleModeChange('signup')}
          className="text-primary hover:text-accent transition-colors font-medium text-sm"
        >
          Don't have an account? Sign up
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('recover')}
          className="text-muted-foreground hover:text-foreground transition-colors text-xs"
        >
          Forgot username or password? Recover account
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

  const renderRecoverForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="p-4 bg-card border border-border rounded-lg">
        <div className="flex items-start gap-3">
          <KeyRound className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Enter your 12-word recovery phrase and set a new password to recover your account.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="backup-phrase" className="text-foreground font-medium">
            Recovery Phrase
          </Label>
          <textarea
            id="backup-phrase"
            placeholder="Enter your 12-word recovery phrase"
            value={formData.backupPhrase}
            onChange={(e) => setFormData({ ...formData, backupPhrase: e.target.value })}
            className="w-full h-24 px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-foreground font-medium">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a new password (min 6 characters)"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
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
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full btn-gold text-lg py-6"
      >
        {loading ? <div className="spinner-gold" /> : 'Recover Account'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => handleModeChange('login')}
          className="text-primary hover:text-accent transition-colors font-medium text-sm"
        >
          Back to login
        </button>
      </div>
    </form>
  );

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join DARK AMAZON';
      case 'recover': return 'Recover Account';
      case 'showPhrase': return 'Save Your Recovery Phrase';
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
        {mode === 'recover' && renderRecoverForm()}
        {mode === 'showPhrase' && renderShowPhrase()}
      </DialogContent>
    </Dialog>
  );
}

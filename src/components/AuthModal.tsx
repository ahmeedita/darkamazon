import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User, Eye, EyeOff, Copy, Check, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'recovery-phrase' | 'forgot-password' | 'recovery-success';

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    recoveryPhraseInput: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [recoveredUsername, setRecoveredUsername] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { signUp, signIn, recoverAccount } = useAuth();

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      recoveryPhraseInput: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setRecoveryPhrase('');
    setRecoveredUsername('');
    setCopied(false);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recoveryPhrase);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Recovery phrase copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Please manually copy the recovery phrase',
        variant: 'destructive',
      });
    }
  };

  const handleContinueAfterRecovery = () => {
    onSuccess();
    onClose();
    resetForm();
    setMode('login');
  };

  const handleRecoverySubmit = async () => {
    if (!formData.recoveryPhraseInput.trim()) {
      toast({
        title: 'Recovery phrase required',
        description: 'Please enter your 6-word recovery phrase',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'New password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await recoverAccount(formData.recoveryPhraseInput, formData.newPassword);
      
      if (result.error) {
        toast({
          title: 'Recovery failed',
          description: result.error,
          variant: 'destructive',
        });
      } else if (result.username) {
        setRecoveredUsername(result.username);
        setMode('recovery-success');
        toast({
          title: 'Account found!',
          description: `Your username is: ${result.username}`,
        });
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
            description: 'Successfully logged in to torbuy',
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
        } else if (result.recoveryPhrase) {
          // Show recovery phrase from backend
          setRecoveryPhrase(result.recoveryPhrase);
          setMode('recovery-phrase');
          toast({
            title: 'Account created!',
            description: 'Please save your recovery phrase',
          });
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

  const renderRecoveryPhraseScreen = () => (
    <div className="space-y-6 mt-6">
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-sm text-red-300 text-center font-medium">
          ⚠️ IMPORTANT: Save this recovery phrase!
        </p>
        <p className="text-xs text-red-200/70 text-center mt-1">
          This is the ONLY way to recover your account if you forget your username or password.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Key className="w-5 h-5 text-primary" />
          <span className="text-foreground font-medium">Your Recovery Phrase</span>
        </div>
        
        <div className="relative p-4 bg-background border border-border rounded-lg">
          <p className="text-center text-foreground font-mono text-lg break-words">
            {recoveryPhrase}
          </p>
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-2 hover:bg-secondary rounded-md transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success-high" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <ul className="text-xs text-amber-200 space-y-1">
            <li>• Write down this phrase and store it safely</li>
            <li>• Never share it with anyone</li>
            <li>• You'll need this to recover your account</li>
          </ul>
        </div>
      </div>

      <Button
        onClick={handleContinueAfterRecovery}
        className="w-full btn-gold text-lg py-6"
      >
        I've Saved My Recovery Phrase
      </Button>
    </div>
  );

  const renderRecoverySuccessScreen = () => (
    <div className="space-y-6 mt-6">
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <p className="text-sm text-green-300 text-center font-medium">
          ✓ Account Found!
        </p>
        <p className="text-xs text-green-200/70 text-center mt-1">
          Your recovery phrase matched an account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-background border border-border rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-2">Your username is:</p>
          <p className="text-xl font-bold text-foreground">{recoveredUsername}</p>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-xs text-amber-200 text-center">
            ⚠️ To reset your password, please contact support via live chat with your username and recovery phrase.
          </p>
        </div>
      </div>

      <Button
        onClick={() => {
          if (typeof window !== 'undefined' && (window as any).Tawk_API) {
            (window as any).Tawk_API.maximize();
          }
        }}
        className="w-full btn-gold text-lg py-6"
      >
        Contact Support to Reset Password
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => handleModeChange('login')}
          className="text-primary hover:text-accent transition-colors font-medium text-sm"
        >
          Back to Sign In
        </button>
      </div>
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

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => handleModeChange('forgot-password')}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          Forgot username or password?
        </button>
        <div>
          <button
            type="button"
            onClick={() => handleModeChange('signup')}
            className="text-primary hover:text-accent transition-colors font-medium text-sm"
          >
            Don't have an account? Sign up
          </button>
        </div>
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

  const renderForgotPasswordForm = () => (
    <div className="space-y-6 mt-6">
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-sm text-foreground text-center font-medium">
          🔑 Account Recovery
        </p>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Enter your recovery phrase to find your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recovery-input" className="text-foreground font-medium">
            Recovery Phrase
          </Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="recovery-input"
              type="text"
              placeholder="Enter your 6-word recovery phrase"
              value={formData.recoveryPhraseInput}
              onChange={(e) => setFormData({ ...formData, recoveryPhraseInput: e.target.value })}
              className="pl-10 input-premium"
            />
          </div>
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
              placeholder="Enter new password (min 6 characters)"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="pl-10 pr-10 input-premium"
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
          <Label htmlFor="confirm-new-password" className="text-foreground font-medium">
            Confirm New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirm-new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={formData.confirmNewPassword}
              onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
              className="pl-10 input-premium"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleRecoverySubmit}
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
          Back to Sign In
        </button>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join torbuy';
      case 'recovery-phrase': return 'Save Your Recovery Phrase';
      case 'forgot-password': return 'Recover Account';
      case 'recovery-success': return 'Account Found';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          resetForm();
          setMode('login');
        }
      }}
    >
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl text-foreground">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        {mode === 'login' && renderLoginForm()}
        {mode === 'signup' && renderSignupForm()}
        {mode === 'recovery-phrase' && renderRecoveryPhraseScreen()}
        {mode === 'forgot-password' && renderForgotPasswordForm()}
        {mode === 'recovery-success' && renderRecoverySuccessScreen()}
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  orderId: string;
  onPaymentInitiated: () => void;
  deliveryEmail: string;
  recipientEmail?: string;
  initialCrypto?: string;
  initialAddress?: string;
  initialExpiresAt?: string;
}

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
  { symbol: 'LTC', name: 'Litecoin', icon: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg' },
  { symbol: 'XMR', name: 'Monero', icon: 'https://cryptologos.cc/logos/monero-xmr-logo.svg' },
];

export function CryptoPaymentModal({ 
  isOpen, 
  onClose, 
  total, 
  orderId, 
  onPaymentInitiated, 
  deliveryEmail, 
  recipientEmail,
  initialCrypto,
  initialAddress,
  initialExpiresAt
}: CryptoPaymentModalProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(initialCrypto || null);
  const [paymentAddress, setPaymentAddress] = useState<string | null>(initialAddress || null);
  const [expiresAt, setExpiresAt] = useState<string | null>(initialExpiresAt || null);
  const [cryptoAmount, setCryptoAmount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedCryptoAmount, setCopiedCryptoAmount] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState(100);

  // Set initial values when modal opens with resume data
  useEffect(() => {
    if (initialCrypto && initialAddress) {
      setSelectedCrypto(initialCrypto);
      setPaymentAddress(initialAddress);
      setExpiresAt(initialExpiresAt || null);
    }
  }, [initialCrypto, initialAddress, initialExpiresAt]);

  // Update countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const remaining = expiry - now;
      
      if (remaining <= 0) {
        setTimeRemaining('Expired');
        setProgressPercent(0);
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      // Assuming 24 hour expiry
      const totalTime = 24 * 60 * 60 * 1000;
      const percent = Math.min(100, (remaining / totalTime) * 100);
      
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      setProgressPercent(percent);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleSelectCrypto = async (symbol: string) => {
    setSelectedCrypto(symbol);
    setIsLoading(true);
    setPaymentAddress(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { symbol, orderId, amount: total, deliveryEmail, recipientEmail },
      });

      if (error) throw error;

      if (data?.paymentAddress) {
        setPaymentAddress(data.paymentAddress);
        setExpiresAt(data.expiresAt);
        setCryptoAmount(data.cryptoAmount || null);
        
        // Store payment details in localStorage for order resume
        const paymentDetails = {
          crypto: symbol,
          address: data.paymentAddress,
          expiresAt: data.expiresAt,
          cryptoAmount: data.cryptoAmount,
        };
        localStorage.setItem(`payment_${orderId}`, JSON.stringify(paymentDetails));
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Failed to generate payment address');
      setSelectedCrypto(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (paymentAddress) {
      navigator.clipboard.writeText(paymentAddress);
      setCopiedAddress(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(total.toFixed(2));
    setCopiedAmount(true);
    toast.success('Amount copied to clipboard');
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyCryptoAmount = () => {
    if (cryptoAmount) {
      navigator.clipboard.writeText(cryptoAmount);
      setCopiedCryptoAmount(true);
      toast.success('Crypto amount copied to clipboard');
      setTimeout(() => setCopiedCryptoAmount(false), 2000);
    }
  };

  const handleConfirmPayment = () => {
    toast.success('Payment initiated! Your order is now pending confirmation.');
    onPaymentInitiated();
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setSelectedCrypto(null);
    setPaymentAddress(null);
    setExpiresAt(null);
  };

  const selectedCryptoData = CRYPTO_OPTIONS.find(c => c.symbol === selectedCrypto);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0d1421] border-[#1e293b] max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            {selectedCrypto && (
              <div className="bg-[#1e293b] px-3 py-1.5 rounded-md flex items-center gap-2">
                <img src={selectedCryptoData?.icon} alt={selectedCrypto} className="w-4 h-4" />
                <span className="text-white font-medium text-sm">{selectedCrypto}</span>
                <span className="text-muted-foreground text-sm">Payment</span>
              </div>
            )}
            {!selectedCrypto && (
              <span className="text-white font-medium">Select Payment Method</span>
            )}
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!selectedCrypto ? (
            <>
              <div className="text-center mb-4">
                <p className="text-muted-foreground text-sm">Order Total</p>
                <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CRYPTO_OPTIONS.map((crypto) => (
                  <Button
                    key={crypto.symbol}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 bg-[#1e293b]/50 border-[#334155] hover:border-primary hover:bg-[#1e293b]"
                    onClick={() => handleSelectCrypto(crypto.symbol)}
                  >
                    <img src={crypto.icon} alt={crypto.name} className="w-8 h-8" />
                    <span className="font-medium text-white">{crypto.symbol}</span>
                    <span className="text-xs text-muted-foreground">{crypto.name}</span>
                  </Button>
                ))}
              </div>
            </>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <span className="text-muted-foreground">Generating payment address...</span>
            </div>
          ) : paymentAddress ? (
            <>
              {/* Payment Instructions */}
              <div>
                <h3 className="text-white font-semibold mb-2">Payment Instructions</h3>
                <p className="text-muted-foreground text-sm">
                  Send your order total to the address below. Once the network confirms your payment, we'll complete your order automatically. <strong className="text-white">This is a one time payment address. Do only send once to this address.</strong>
                </p>
              </div>

              {/* Amount and Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1e293b]/50 rounded-lg p-4 border border-[#334155]">
                  <p className="text-primary text-xs mb-1">Amount (USD)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xl font-bold">${total.toFixed(2)}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2 bg-[#334155] hover:bg-[#475569] text-white text-xs"
                      onClick={handleCopyAmount}
                    >
                      {copiedAmount ? <Check className="w-3 h-3" /> : 'Copy'}
                    </Button>
                  </div>
                </div>
                <div className="bg-[#1e293b]/50 rounded-lg p-4 border border-[#334155]">
                  <p className="text-primary text-xs mb-1">Amount ({selectedCrypto})</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-lg font-bold font-mono">
                      {cryptoAmount || '...'} 
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2 bg-[#334155] hover:bg-[#475569] text-white text-xs"
                      onClick={handleCopyCryptoAmount}
                      disabled={!cryptoAmount}
                    >
                      {copiedCryptoAmount ? <Check className="w-3 h-3" /> : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expiry Timer */}
              <div className="bg-[#1e293b]/50 rounded-lg p-4 border border-[#334155]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-xs">Expires in</p>
                  <p className="text-white text-sm font-medium">{timeRemaining}</p>
                </div>
                <Progress 
                  value={progressPercent} 
                  className="h-2 bg-[#334155]"
                />
              </div>

              {/* Payment Address */}
              <div className="bg-[#1e293b]/50 rounded-lg p-4 border border-[#334155]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-primary text-xs">Address</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 px-3 bg-[#334155] hover:bg-[#475569] text-white text-xs"
                    onClick={handleCopyAddress}
                  >
                    {copiedAddress ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    Copy
                  </Button>
                </div>
                <p className="font-mono text-white text-sm break-all">{paymentAddress}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#334155]">
                  <div>
                    <p className="text-muted-foreground text-xs">Received:</p>
                    <p className="text-primary font-mono">0.00000000</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Confirmations:</p>
                    <p className="text-primary font-mono">0 / 1</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500 text-sm font-medium">Awaiting payment</span>
                </div>
                <span className="text-muted-foreground text-xs">Powered by NoKYCPay.me</span>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  className="w-full btn-gold"
                  onClick={handleConfirmPayment}
                >
                  I've Sent the Payment
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-white"
                  onClick={() => {
                    setSelectedCrypto(null);
                    setPaymentAddress(null);
                    setExpiresAt(null);
                  }}
                >
                  Choose Different Crypto
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  orderId: string;
  onPaymentInitiated: () => void;
  deliveryEmail: string;
  recipientEmail?: string;
}

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
  { symbol: 'BNB', name: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg' },
  { symbol: 'SOL', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.svg' },
];

export function CryptoPaymentModal({ isOpen, onClose, total, orderId, onPaymentInitiated, deliveryEmail, recipientEmail }: CryptoPaymentModalProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmPayment = () => {
    toast.success('Payment initiated! Your order is now pending confirmation.');
    onPaymentInitiated();
    onClose();
    setSelectedCrypto(null);
    setPaymentAddress(null);
  };

  const handleClose = () => {
    onClose();
    setSelectedCrypto(null);
    setPaymentAddress(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground font-display text-xl">
            Pay with Cryptocurrency
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center py-2">
            <p className="text-muted-foreground text-sm">Order Total</p>
            <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Delivery to: {deliveryEmail}</p>
            {recipientEmail && (
              <p className="text-xs text-muted-foreground">Recipient: {recipientEmail}</p>
            )}
          </div>

          {!selectedCrypto ? (
            <div className="grid grid-cols-2 gap-3">
              {CRYPTO_OPTIONS.map((crypto) => (
                <Button
                  key={crypto.symbol}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 border-border hover:border-primary hover:bg-primary/10"
                  onClick={() => handleSelectCrypto(crypto.symbol)}
                >
                  <img src={crypto.icon} alt={crypto.name} className="w-8 h-8" />
                  <span className="font-medium text-foreground">{crypto.symbol}</span>
                  <span className="text-xs text-muted-foreground">{crypto.name}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-lg">
                <img 
                  src={CRYPTO_OPTIONS.find(c => c.symbol === selectedCrypto)?.icon} 
                  alt={selectedCrypto} 
                  className="w-6 h-6" 
                />
                <span className="font-medium text-foreground">{selectedCrypto}</span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Generating address...</span>
                </div>
              ) : paymentAddress ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Send exactly <span className="text-primary font-bold">${total.toFixed(2)}</span> worth of {selectedCrypto} to:
                  </p>
                  
                  <div className="bg-muted/50 p-3 rounded-lg border border-border">
                    <p className="font-mono text-xs text-foreground break-all text-center">
                      {paymentAddress}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-border"
                    onClick={handleCopyAddress}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Address
                      </>
                    )}
                  </Button>

                  <Button
                    className="w-full btn-gold"
                    onClick={handleConfirmPayment}
                  >
                    I've Sent the Payment
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => {
                      setSelectedCrypto(null);
                      setPaymentAddress(null);
                    }}
                  >
                    Choose Different Crypto
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Payment will be confirmed after 2 blockchain confirmations
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Copy, Upload, IndianRupee, Loader } from "lucide-react";

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMoneyModal({ isOpen, onClose }: AddMoneyModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const UPI_ID = "sauravans2@okaxis";

  // Detect when user returns from UPI app
  useEffect(() => {
    if (!paymentInProgress) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setPaymentInProgress(false);
        toast({
          title: "Payment Completed?",
          description: "Enter the UTR from your payment confirmation",
        });
      }
    };

    const handleFocus = () => {
      if (paymentInProgress) {
        setPaymentInProgress(false);
        toast({
          title: "Welcome Back!",
          description: "Please enter your UTR to complete the transaction",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [paymentInProgress, toast]);

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast({
      title: "UPI ID Copied",
      description: "Paste it in your payment app",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const generateUPILink = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Check if mobile device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // Generate unique transaction ID
      const txnId = `TXN${Date.now()}`;

      // Create UPI deep link
      const upiLink = `upi://pay?pa=${UPI_ID}&pn=SV%20Scrims&am=${amount}&tn=Add%20Money%20to%20Wallet&tr=${txnId}`;

      setPaymentInProgress(true);

      // Open UPI app
      window.location.href = upiLink;
    } else {
      // Desktop: Show manual payment instructions
      toast({
        title: "Desktop Testing Mode",
        description:
          "UPI deep links work on mobile. For desktop testing, manually complete payment and enter UTR below.",
        variant: "default",
      });
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!utr && !screenshot) {
      toast({
        title: "Missing information",
        description: "Please enter UTR or upload screenshot",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("amount", amount);
      if (utr) formData.append("utr", utr);
      if (screenshot) formData.append("screenshot", screenshot);

      await apiRequest("POST", "/api/wallet/add", formData);

      toast({
        title: "Request submitted",
        description:
          "Your add money request is pending admin approval. Money will appear in wallet once verified.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });

      // Reset form
      setAmount("");
      setUtr("");
      setScreenshot(null);
      onClose();
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Money to Wallet</DialogTitle>
          <DialogDescription>
            Complete your payment and submit transaction details for admin
            verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative mt-2">
              <IndianRupee
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-10 text-lg font-mono"
                data-testid="input-amount"
                disabled={paymentInProgress}
              />
            </div>
          </div>

          {paymentInProgress ? (
            <div className="p-6 border border-border rounded-lg bg-muted/50 text-center space-y-4">
              <Loader className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-semibold text-lg">Payment in Progress...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete the payment in your UPI app and return here
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Once you complete the payment, this screen will automatically
                update
              </p>
            </div>
          ) : (
            <>
              <div className="p-6 border border-border rounded-lg bg-muted/50 text-center space-y-4">
                <div>
                  <Label className="text-sm font-medium">UPI ID</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 px-4 py-3 bg-background border rounded-lg font-mono text-lg">
                      {UPI_ID}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyUPI}
                      data-testid="button-copy-upi"
                    >
                      <Copy size={18} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div>
                  <Label htmlFor="utr">UTR Number</Label>
                  <Input
                    id="utr"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="Enter 12-digit UTR from payment confirmation"
                    className="mt-2 font-mono"
                    data-testid="input-utr"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    You'll receive this after completing the payment
                  </p>
                </div>

                <div>
                  <Label htmlFor="screenshot">
                    Payment Screenshot (Optional)
                  </Label>
                  <div className="mt-2">
                    <label
                      htmlFor="screenshot"
                      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover-elevate active-elevate-2"
                      data-testid="label-upload"
                    >
                      <Upload size={18} />
                      <span className="text-sm font-medium">
                        {screenshot ? screenshot.name : "Upload Screenshot"}
                      </span>
                    </label>
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="input-screenshot"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={generateUPILink}
                  disabled={!amount || parseFloat(amount) <= 0}
                  data-testid="button-pay-now"
                >
                  Pay ₹{amount || "0"} Now
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !utr}
                  data-testid="button-submit"
                >
                  {isSubmitting ? "Submitting..." : "Submit Payment Details"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                ℹ️ Money will appear in your wallet after admin verification
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

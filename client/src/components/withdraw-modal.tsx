import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { IndianRupee } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!upiId) {
      toast({
        title: "Missing UPI ID",
        description: "Please enter your UPI ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/wallet/withdraw", {
        amount,
        upiId,
      });

      toast({
        title: "Request submitted",
        description: "Your withdrawal request is pending admin approval",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Withdraw Money</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative mt-2">
              <IndianRupee size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-10 text-lg font-mono"
                data-testid="input-amount"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="upiId">Your UPI ID</Label>
            <Input
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@paytm"
              className="mt-2 font-mono"
              data-testid="input-upi-id"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Money will be transferred to this UPI ID
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-testid="button-submit"
          >
            {isSubmitting ? "Submitting..." : "Submit Withdrawal Request"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Withdrawal requests are processed within 24-48 hours
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Copy, Upload, IndianRupee } from "lucide-react";

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

  const UPI_ID = "sauravans2@okaxis";

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
        description: "Your add money request is pending admin approval",
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Money to Wallet</DialogTitle>
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

          <div className="p-6 border border-border rounded-lg bg-muted/50 text-center space-y-4">
            <div className="w-64 h-64 mx-auto bg-white rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">QR Code Placeholder</p>
            </div>
            
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
              <Label htmlFor="utr">UTR Number (Optional)</Label>
              <Input
                id="utr"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter 12-digit UTR"
                className="mt-2 font-mono"
                data-testid="input-utr"
              />
            </div>

            <div>
              <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
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

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-testid="button-submit"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

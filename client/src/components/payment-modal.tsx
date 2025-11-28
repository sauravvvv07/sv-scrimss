import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Copy, Upload, IndianRupee } from "lucide-react";
import type { Scrim } from "@shared/schema";

interface PaymentModalProps {
  scrim: Scrim;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ scrim, isOpen, onClose }: PaymentModalProps) {
  const { toast } = useToast();
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const UPI_ID = "sauravans21@okaxis";

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
      formData.append("scrimId", scrim.id.toString());
      formData.append("amount", scrim.entryFee.toString());
      if (utr) formData.append("utr", utr);
      if (screenshot) formData.append("screenshot", screenshot);

      await apiRequest("POST", "/api/payment/register", formData);

      toast({
        title: "Registration submitted",
        description:
          "Your payment is being verified. You'll be notified once approved.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/scrims"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/profile/registrations"],
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Registration failed",
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
          <DialogTitle className="text-2xl">{scrim.matchType}</DialogTitle>
          <div className="flex items-center gap-1 text-3xl font-bold font-mono text-primary pt-2">
            <IndianRupee size={24} />
            <span>{scrim.entryFee}</span>
            <span className="text-base font-normal text-muted-foreground ml-2">
              Entry Fee
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-6 border border-border rounded-lg bg-muted/50 text-center space-y-4">
            <div className="w-64 h-64 mx-auto bg-white rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                QR Code Placeholder
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
                For faster verification, enter your payment UTR
              </p>
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
            data-testid="button-confirm-payment"
          >
            {isSubmitting ? "Submitting..." : "Confirm Payment & Register"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your registration will be confirmed once payment is verified by
            admin
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

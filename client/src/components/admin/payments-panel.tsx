import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, ExternalLink, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";

export function PaymentsPanel() {
  const { toast } = useToast();

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
  });

  const pendingTransactions = transactions?.filter((t) => t.paymentStatus === "pending") || [];

  const handleApprove = async (txnId: number) => {
    try {
      await apiRequest("POST", `/api/admin/transactions/${txnId}/approve`, {});

      toast({
        title: "Payment approved",
        description: "Transaction has been approved and wallet updated",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
    } catch (error: any) {
      toast({
        title: "Failed to approve",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (txnId: number) => {
    try {
      await apiRequest("POST", `/api/admin/transactions/${txnId}/reject`, {});

      toast({
        title: "Payment rejected",
        description: "Transaction has been rejected",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
    } catch (error: any) {
      toast({
        title: "Failed to reject",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payments ({pendingTransactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : pendingTransactions.length > 0 ? (
          <div className="space-y-4">
            {pendingTransactions.map((txn: any) => (
              <Card key={txn.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-lg">
                            {txn.user?.username || "Unknown User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Player ID: {txn.user?.playerId || "N/A"}
                          </div>
                        </div>
                        <Badge variant="secondary">{txn.type}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Amount</div>
                          <div className="flex items-center gap-1 text-xl font-bold font-mono">
                            <IndianRupee size={16} />
                            <span>{txn.amount}</span>
                          </div>
                        </div>
                        {txn.utr && (
                          <div>
                            <div className="text-sm text-muted-foreground">UTR</div>
                            <div className="font-mono text-sm">{txn.utr}</div>
                          </div>
                        )}
                      </div>

                      {txn.scrimId && (
                        <div>
                          <div className="text-sm text-muted-foreground">Scrim</div>
                          <div className="text-sm">ID: {txn.scrimId}</div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {txn.screenshotUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full md:w-auto"
                          onClick={() => window.open(txn.screenshotUrl, "_blank")}
                          data-testid={`button-view-screenshot-${txn.id}`}
                        >
                          <ExternalLink size={16} className="mr-2" />
                          View Screenshot
                        </Button>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(txn.id)}
                          data-testid={`button-approve-${txn.id}`}
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(txn.id)}
                          data-testid={`button-reject-${txn.id}`}
                        >
                          <XCircle size={16} className="mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up</h3>
            <p className="text-muted-foreground">No pending payments to review</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

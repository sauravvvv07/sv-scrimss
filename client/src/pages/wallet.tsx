import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet as WalletIcon, Plus, Minus, IndianRupee, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { AddMoneyModal } from "@/components/add-money-modal";
import { WithdrawModal } from "@/components/withdraw-modal";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import type { Transaction } from "@shared/schema";

export default function Wallet() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/wallet/transactions"],
  });

  const { data: walletData } = useQuery<{ balance: string }>({
    queryKey: ["/api/wallet/balance"],
  });

  const balance = walletData?.balance || "0";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle size={16} className="text-green-500" />;
      case "rejected":
        return <XCircle size={16} className="text-destructive" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "prize":
        return "text-green-600";
      case "withdraw":
      case "entryFee":
        return "text-destructive";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Wallet</h1>
        <p className="text-muted-foreground text-lg">Manage your funds and transactions</p>
      </div>

      <Card className="mb-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <WalletIcon size={20} />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 text-5xl font-bold font-mono mb-6">
            <IndianRupee size={36} />
            <span>{balance}</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowAddMoney(true)}
              data-testid="button-add-money"
            >
              <Plus size={18} className="mr-2" />
              Add Money
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 hover:bg-white/20"
              onClick={() => setShowWithdraw(true)}
              data-testid="button-withdraw"
            >
              <Minus size={18} className="mr-2" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`transaction-${txn.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{txn.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {getStatusIcon(txn.paymentStatus)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleString()}
                    </div>
                    {txn.utr && (
                      <div className="text-xs font-mono text-muted-foreground mt-1">
                        UTR: {txn.utr}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold font-mono flex items-center gap-1 ${getTypeColor(txn.type)}`}>
                      {(txn.type === "withdraw" || txn.type === "entryFee") && "-"}
                      {(txn.type === "add" || txn.type === "prize") && "+"}
                      <IndianRupee size={16} />
                      <span>{txn.amount}</span>
                    </div>
                    <Badge variant={txn.paymentStatus === "verified" ? "default" : txn.paymentStatus === "rejected" ? "destructive" : "secondary"} className="mt-1">
                      {txn.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <WalletIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
              <p className="text-muted-foreground">Your transaction history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddMoney && <AddMoneyModal isOpen={showAddMoney} onClose={() => setShowAddMoney(false)} />}
      {showWithdraw && <WithdrawModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} />}
    </div>
  );
}

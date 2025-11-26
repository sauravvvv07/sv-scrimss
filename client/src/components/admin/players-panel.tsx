import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Ban, CheckCircle, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function PlayersPanel() {
  const { toast } = useToast();

  const { data: players, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/players"],
  });

  const handleBan = async (userId: number) => {
    try {
      await apiRequest("POST", `/api/admin/players/${userId}/ban`, {});

      toast({
        title: "Player banned",
        description: "Player has been banned from the platform",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
    } catch (error: any) {
      toast({
        title: "Failed to ban player",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleUnban = async (userId: number) => {
    try {
      await apiRequest("POST", `/api/admin/players/${userId}/unban`, {});

      toast({
        title: "Player unbanned",
        description: "Player can now access the platform",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
    } catch (error: any) {
      toast({
        title: "Failed to unban player",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Players ({players?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : players && players.length > 0 ? (
          <div className="space-y-3">
            {players.map((player) => (
              <Card key={player.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold text-lg">{player.username}</div>
                        {player.role === "admin" && <Badge variant="default">Admin</Badge>}
                        {player.banned && <Badge variant="destructive">Banned</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Player ID: <span className="font-mono">{player.playerId}</span></div>
                        <div>Email: {player.email}</div>
                        {player.mobile && <div>Mobile: {player.mobile}</div>}
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-1 text-lg font-mono font-semibold">
                        <IndianRupee size={16} />
                        <span>{player.walletBalance}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.totalMatches} matches • {player.totalWins} wins
                      </div>
                      {player.role !== "admin" && (
                        <div>
                          {player.banned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnban(player.id)}
                              data-testid={`button-unban-${player.id}`}
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBan(player.id)}
                              data-testid={`button-ban-${player.id}`}
                            >
                              <Ban size={16} className="mr-2" />
                              Ban
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Players Yet</h3>
            <p className="text-muted-foreground">Players will appear here once they sign up</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

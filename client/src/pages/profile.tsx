import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  IndianRupee,
  Lock,
  Copy,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ScrimRegistration } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [countdowns, setCountdowns] = useState<Record<number, string>>({});

  if (!user) {
    setLocation("/login");
    return null;
  }

  const { data: registrations, isLoading } = useQuery<ScrimRegistration[]>({
    queryKey: ["/api/profile/registrations"],
  });

  // Countdown timer for room opening
  useEffect(() => {
    const interval = setInterval(() => {
      if (!registrations) return;

      const newCountdowns: Record<number, string> = {};
      registrations.forEach((reg: any) => {
        if (reg.scrim?.date && reg.scrim?.time) {
          const scrimDateTime = new Date(`${reg.scrim.date}T${reg.scrim.time}`);
          const roomOpenTime = new Date(scrimDateTime.getTime() - 10 * 60000); // 10 min before
          const now = new Date();
          const diff = roomOpenTime.getTime() - now.getTime();

          if (diff > 0) {
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            newCountdowns[reg.id] = `${mins}m ${secs}s`;
          } else if (diff > -3600000) {
            // Within 1 hour after room opens
            newCountdowns[reg.id] = "Room Open";
          }
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [registrations]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied`,
      description: "Paste it in the game to join",
    });
  };

  const stats = [
    {
      icon: Trophy,
      label: "Matches Won",
      value: user.totalWins || 0,
      color: "text-yellow-500",
    },
    {
      icon: Target,
      label: "Total Kills",
      value: user.totalKills || 0,
      color: "text-destructive",
    },
    {
      icon: Calendar,
      label: "Matches Played",
      value: user.totalMatches || 0,
      color: "text-primary",
    },
    {
      icon: Clock,
      label: "Avg Survival (min)",
      value: user.avgSurvivalTime || 0,
      color: "text-green-500",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground text-lg">
          View your stats and match history
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{user.username}</CardTitle>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Player ID:</span>
                  <code
                    className="px-2 py-1 bg-muted rounded font-mono font-semibold"
                    data-testid="text-player-id"
                  >
                    {user.playerId}
                  </code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{user.email}</span>
                </div>
                {user.mobile && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span>{user.mobile}</span>
                  </div>
                )}
              </div>
            </div>
            {user.role === "admin" && (
              <Badge variant="default" className="mt-1">
                Admin
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-3xl font-bold font-mono mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : registrations && registrations.length > 0 ? (
            <div className="space-y-4">
              {registrations.map((reg: any) => (
                <div
                  key={reg.id}
                  className="p-4 border rounded-lg space-y-3 hover-elevate"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">
                        {reg.scrim?.matchType}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reg.scrim?.map} • {reg.scrim?.date} at{" "}
                        {reg.scrim?.time}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary">{reg.paymentStatus}</Badge>
                        {reg.scrim?.status && (
                          <Badge variant="outline">{reg.scrim.status}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xl font-mono font-semibold mb-2">
                        <IndianRupee size={18} />
                        <span>{reg.scrim?.entryFee || 0}</span>
                      </div>
                      {countdowns[reg.id] && (
                        <div className="text-sm font-semibold text-primary">
                          {countdowns[reg.id]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ROOM CREDENTIALS SECTION */}
                  {reg.paymentStatus === "verified" && (
                    <div className="p-3 bg-muted/50 rounded-lg space-y-2 border border-border">
                      {reg.scrim?.roomId && reg.scrim?.roomPassword ? (
                        <>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Room Credentials
                          </p>
                          <div className="space-y-2">
                            {/* Room ID */}
                            <div className="flex items-center justify-between gap-2 p-2 bg-background rounded border border-border">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Room ID
                                </p>
                                <code className="font-mono font-semibold text-sm block truncate">
                                  {reg.scrim.roomId}
                                </code>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(reg.scrim.roomId, "Room ID")
                                }
                                className="p-2 hover-elevate rounded flex-shrink-0"
                                data-testid="button-copy-roomid"
                              >
                                <Copy size={16} />
                              </button>
                            </div>

                            {/* Room Password */}
                            <div className="flex items-center justify-between gap-2 p-2 bg-background rounded border border-border">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Password
                                </p>
                                <code className="font-mono font-semibold text-sm block truncate">
                                  {reg.scrim.roomPassword}
                                </code>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    reg.scrim.roomPassword,
                                    "Password"
                                  )
                                }
                                className="p-2 hover-elevate rounded flex-shrink-0"
                                data-testid="button-copy-password"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock size={16} />
                          <span>
                            Room credentials coming soon. Admin will post them
                            before match.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Registrations Yet
              </h3>
              <p className="text-muted-foreground">
                Join a scrim to see your registered matches here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : registrations && registrations.length > 0 ? (
            <div className="space-y-3">
              {registrations.map((reg: any) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                >
                  <div className="flex-1">
                    <div className="font-semibold mb-1">
                      {reg.scrim?.matchType || "Match"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reg.scrim?.date} at {reg.scrim?.time}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {reg.scrim?.map}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-mono font-semibold mb-1">
                      <IndianRupee size={16} />
                      <span>{reg.scrim?.entryFee || 0}</span>
                    </div>
                    <Badge
                      variant={
                        reg.paymentStatus === "verified"
                          ? "default"
                          : reg.paymentStatus === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {reg.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
              <p className="text-muted-foreground">
                Join your first scrim to start your journey
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

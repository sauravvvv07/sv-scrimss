import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, Clock, TrendingUp, Calendar, IndianRupee } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import type { ScrimRegistration } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const { data: registrations, isLoading } = useQuery<ScrimRegistration[]>({
    queryKey: ["/api/profile/registrations"],
  });

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
        <p className="text-muted-foreground text-lg">View your stats and match history</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{user.username}</CardTitle>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Player ID:</span>
                  <code className="px-2 py-1 bg-muted rounded font-mono font-semibold" data-testid="text-player-id">
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
              <Badge variant="default" className="mt-1">Admin</Badge>
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
                <div className="text-3xl font-bold font-mono mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                    <div className="font-semibold mb-1">{reg.scrim?.matchType || "Match"}</div>
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
              <p className="text-muted-foreground">Join your first scrim to start your journey</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

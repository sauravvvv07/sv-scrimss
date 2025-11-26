import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, Clock, TrendingUp } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

export default function Leaderboard() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const { data: entries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard", period],
  });

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-600";
    return "text-muted-foreground";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground text-lg">Top players across all scrims</p>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="mb-8">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
          <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
        </TabsList>

        {["daily", "weekly", "monthly"].map((p) => (
          <TabsContent key={p} value={p} className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : entries && entries.length > 0 ? (
              <div className="space-y-3">
                {entries.map((entry: any, index) => (
                  <Card key={entry.id} className="hover-elevate">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl font-bold font-mono w-16 text-center ${getMedalColor(index + 1)}`}>
                          {index + 1 <= 3 ? <Trophy size={32} className="mx-auto" /> : `#${index + 1}`}
                        </div>

                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-1">{entry.user?.username || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            ID: {entry.user?.playerId || "N/A"}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="flex items-center justify-center gap-1 text-destructive mb-1">
                              <Target size={16} />
                              <span className="text-2xl font-bold font-mono">{entry.kills}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Kills</div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                              <Trophy size={16} />
                              <span className="text-2xl font-bold font-mono">{entry.wins}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Wins</div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                              <Clock size={16} />
                              <span className="text-2xl font-bold font-mono">{entry.avgSurvivalTime}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Avg Time</div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1 text-primary mb-1">
                              <TrendingUp size={16} />
                              <span className="text-2xl font-bold font-mono">{entry.positionPoints}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Points</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
                <p className="text-muted-foreground">Leaderboard will update as players compete</p>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

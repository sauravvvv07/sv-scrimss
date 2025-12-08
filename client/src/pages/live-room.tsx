import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  MapPin,
  Calendar,
  Clock,
  Users,
  Gamepad2,
  Key,
  Youtube,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

interface LiveScrim {
  id: number;
  matchType: string;
  map: string;
  date: string;
  time: string;
  status: string;
  roomId: string | null;
  roomPassword: string | null;
  youtubeLink: string | null;
  spotsRemaining: number;
  maxPlayers: number;
}

export default function LiveRoom() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, token } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    data: scrim,
    isLoading,
    error,
  } = useQuery<LiveScrim>({
    queryKey: ["/api/scrim", id, "live"],
    queryFn: async () => {
      const res = await fetch(`/api/scrim/${id}/live`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        setAuthError("You must be logged in to view this page");
        throw new Error("Unauthorized");
      }
      if (res.status === 404) {
        setAuthError(
          "You must be registered for this scrim to view room credentials"
        );
        throw new Error("Not found or not authorized");
      }
      if (!res.ok) throw new Error("Failed to fetch");
      setAuthError(null);
      return res.json();
    },
    refetchInterval: 10000,
    enabled: !!token,
  });

  useEffect(() => {
    setLastUpdate(new Date());
  }, [scrim]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="text-muted-foreground" size={28} />
          </div>
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view room credentials.
          </p>
          <Link href="/login">
            <Button className="w-full" data-testid="button-login-live-room">
              Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-destructive" size={28} />
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            {authError ||
              "You must be registered for this scrim to view room credentials."}
          </p>
          <Link href="/scrims">
            <Button
              variant="outline"
              className="w-full"
              data-testid="button-back-scrims"
            >
              Back to Scrims
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!scrim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Room Not Found</h2>
          <p className="text-muted-foreground">
            This scrim may have been deleted.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 py-8 px-4 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Badge
            variant={scrim.status === "live" ? "default" : "secondary"}
            className="text-lg px-4 py-1"
          >
            {scrim.status === "live" ? "LIVE NOW" : scrim.status.toUpperCase()}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">{scrim.matchType}</h1>
          <p className="text-muted-foreground text-lg">Live Room Credentials</p>
        </div>

        <Card className="glass-card overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="text-primary" />
                <span className="font-semibold text-lg">{scrim.map}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {scrim.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {scrim.time}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {scrim.roomId && scrim.roomPassword ? (
              <>
                <div className="grid gap-4">
                  <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Gamepad2 className="text-primary" size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Room ID
                          </p>
                          <p className="text-2xl font-mono font-bold">
                            {scrim.roomId}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(scrim.roomId!, "Room ID")
                        }
                      >
                        <Copy size={18} />
                      </Button>
                    </div>
                  </div>

                  <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Key className="text-primary" size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Password
                          </p>
                          <p className="text-2xl font-mono font-bold">
                            {scrim.roomPassword}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(scrim.roomPassword!, "Password")
                        }
                      >
                        <Copy size={18} />
                      </Button>
                    </div>
                  </div>
                </div>

                {scrim.youtubeLink && (
                  <a
                    href={scrim.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition"
                  >
                    <Youtube size={20} />
                    Watch Live Stream
                  </a>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-muted-foreground" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Waiting for Room Details
                </h3>
                <p className="text-muted-foreground">
                  The admin will share room credentials soon. This page
                  auto-refreshes.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={14} />
                {scrim.maxPlayers - scrim.spotsRemaining}/{scrim.maxPlayers}{" "}
                players
              </span>
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          This page auto-refreshes every 10 seconds
        </p>
      </div>
    </div>
  );
}

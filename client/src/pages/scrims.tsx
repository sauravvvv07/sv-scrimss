import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  MapPin,
  Users,
  IndianRupee,
  Calendar,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { ScrimRegistrationModal } from "@/components/scrim-registration-modal";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import type { Scrim } from "@shared/schema";

export default function Scrims() {
  const { user } = useAuth();
  const [selectedScrim, setSelectedScrim] = useState<Scrim | null>(null);

  const { data: scrims, isLoading } = useQuery<Scrim[]>({
    queryKey: ["/api/scrims"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  const openScrims = scrims?.filter((s) => s.status === "open") || [];
  const liveScrims = scrims?.filter((s) => s.status === "live") || [];
  const completedScrims = scrims?.filter((s) => s.status === "completed") || [];

  const ScrimCard = ({ scrim }: { scrim: Scrim }) => {
    const isFull = scrim.spotsRemaining === 0;
    const isOpen = scrim.status === "open";

    return (
      <Card className="hover-elevate h-full flex flex-col">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-2">
            <Badge
              variant={isOpen ? "default" : "secondary"}
              data-testid={`badge-status-${scrim.id}`}
            >
              {scrim.status}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} />
              <span className="font-medium">{scrim.map}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">{scrim.matchType}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-2xl font-bold font-mono text-primary">
                <IndianRupee size={20} />
                <span>{scrim.entryFee}</span>
              </div>
              <span className="text-sm text-muted-foreground">Entry Fee</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-md">
            <span className="text-sm font-medium">Prize Pool</span>
            <div className="flex items-center font-mono font-semibold text-lg">
              <IndianRupee size={16} />
              <span>{scrim.prizePool}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <span>{scrim.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <span>{scrim.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              <span>
                {scrim.spotsRemaining}/{scrim.maxPlayers} spots remaining
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          {user ? (
            <Button
              className="w-full"
              disabled={isFull || !isOpen}
              onClick={() => setSelectedScrim(scrim)}
              data-testid={`button-register-${scrim.id}`}
            >
              {isFull
                ? "Full"
                : isOpen
                ? "Register & Pay"
                : scrim.status === "live"
                ? "Live Now"
                : "Completed"}
            </Button>
          ) : (
            <Link href="/login" className="w-full">
              <Button
                className="w-full"
                data-testid={`button-login-${scrim.id}`}
              >
                Login to Register
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Scrims & Tournaments
        </h1>
        <p className="text-muted-foreground text-lg">
          Join competitive matches and win prizes
        </p>
      </div>

      {openScrims.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="text-primary" />
            Open for Registration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openScrims.map((scrim) => (
              <ScrimCard key={scrim.id} scrim={scrim} />
            ))}
          </div>
        </div>
      )}

      {liveScrims.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Live Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveScrims.map((scrim) => (
              <ScrimCard key={scrim.id} scrim={scrim} />
            ))}
          </div>
        </div>
      )}

      {completedScrims.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedScrims.map((scrim) => (
              <ScrimCard key={scrim.id} scrim={scrim} />
            ))}
          </div>
        </div>
      )}

      {scrims?.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Scrims Available</h3>
          <p className="text-muted-foreground">
            Check back soon for new tournaments
          </p>
        </Card>
      )}

      {selectedScrim && user && (
        <ScrimRegistrationModal
          scrim={selectedScrim}
          user={user}
          isOpen={!!selectedScrim}
          onClose={() => setSelectedScrim(null)}
        />
      )}
    </div>
  );
}

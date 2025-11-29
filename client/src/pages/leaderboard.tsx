import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Upload, X } from "lucide-react";

type Scrim = {
  id: number;
  scrimName: string;
  matchType: string;
  map: string;
  date: string;
  time: string;
  status: string;
};

type ScrimResult = {
  id: number;
  scrimId: number;
  imageUrl: string;
  standings?: string;
  uploadedAt: string;
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [expandedScrim, setExpandedScrim] = useState<number | null>(null);

  const { data: scrims, isLoading: scrimsLoading } = useQuery<Scrim[]>({
    queryKey: ["/api/scrims"],
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery<
    ScrimResult[]
  >({
    queryKey: ["/api/admin/scrim-results"],
  });

  if (scrimsLoading || resultsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Leaderboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (!scrims || scrims.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Leaderboard</h1>
        <Card className="p-12 text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Scrims Created</h3>
          <p className="text-muted-foreground">
            Scrims will appear here once created
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Live scrim results and standings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scrims.map((scrim) => {
          const scrimResults = results.filter((r) => r.scrimId === scrim.id);
          const isExpanded = expandedScrim === scrim.id;
          const isAdmin = user?.role === "admin";

          return (
            <Card key={scrim.id} className="flex flex-col hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{scrim.scrimName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {scrim.matchType}
                    </p>
                  </div>
                  <Badge variant="outline">{scrim.status}</Badge>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {scrim.map}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {scrim.date} {scrim.time}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Results Display */}
                <div className="space-y-3 mb-4">
                  {scrimResults.length > 0 ? (
                    scrimResults.map((result) => (
                      <div
                        key={result.id}
                        className="border rounded-md overflow-hidden"
                      >
                        <img
                          src={result.imageUrl}
                          alt="Scrim Result"
                          className="w-full h-32 object-cover"
                        />
                        {result.standings && (
                          <div className="p-2 bg-muted text-xs text-muted-foreground">
                            {result.standings}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed rounded-md">
                      <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No results posted yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Section - Admin Only */}
                {isAdmin && (
                  <>
                    {isExpanded && (
                      <ScrimResultUpload
                        scrimId={scrim.id}
                        onUploadComplete={() => setExpandedScrim(null)}
                      />
                    )}

                    <Button
                      size="sm"
                      variant={isExpanded ? "destructive" : "default"}
                      className="w-full mt-auto"
                      onClick={() =>
                        setExpandedScrim(isExpanded ? null : scrim.id)
                      }
                      data-testid={`button-upload-result-${scrim.id}`}
                    >
                      {isExpanded ? (
                        <>
                          <X size={16} className="mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="mr-2" />
                          Post Result
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ScrimResultUpload({
  scrimId,
  onUploadComplete,
}: {
  scrimId: number;
  onUploadComplete: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [standings, setStandings] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("scrimId", scrimId.toString());
    if (standings) formData.append("standings", standings);

    try {
      const response = await fetch("/api/admin/upload-result", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3 mb-4 p-3 bg-muted rounded-md">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="w-full"
        data-testid={`input-result-image-${scrimId}`}
      />
      <textarea
        placeholder="Optional: Standings/Notes"
        value={standings}
        onChange={(e) => setStandings(e.target.value)}
        className="w-full text-xs p-2 rounded border"
        rows={2}
        data-testid={`input-standings-${scrimId}`}
      />
      {isUploading && (
        <p className="text-xs text-muted-foreground">Uploading...</p>
      )}
    </div>
  );
}

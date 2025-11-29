import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { IndianRupee, Users, Trash2 } from "lucide-react";
import type { Scrim } from "@shared/schema";

export function ScrimsManagement() {
  const { toast } = useToast();
  const [selectedScrim, setSelectedScrim] = useState<Scrim | null>(null);
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");

  const { data: scrims, isLoading } = useQuery<Scrim[]>({
    queryKey: ["/api/admin/scrims"],
  });

  const handleUpdateRoom = async () => {
    if (!selectedScrim) return;

    try {
      await apiRequest("POST", `/api/admin/scrims/${selectedScrim.id}/room`, {
        roomId,
        roomPassword,
        youtubeLink,
      });

      toast({
        title: "Room details updated",
        description: "Players can now see the room credentials",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/scrims"] });
      setSelectedScrim(null);
      setRoomId("");
      setRoomPassword("");
      setYoutubeLink("");
    } catch (error: any) {
      toast({
        title: "Failed to update",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (scrimId: number, status: string) => {
    try {
      await apiRequest("POST", `/api/admin/scrims/${scrimId}/status`, {
        status,
      });

      toast({
        title: "Status updated",
        description: `Scrim marked as ${status}`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/scrims"] });
    } catch (error: any) {
      toast({
        title: "Failed to update status",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScrim = async (scrimId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this scrim? All registrations will be removed."
      )
    ) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/admin/scrims/${scrimId}`, {});

      toast({
        title: "Scrim deleted",
        description: "The scrim and all registrations have been removed",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/scrims"] });
    } catch (error: any) {
      toast({
        title: "Failed to delete scrim",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Scrims ({scrims?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : scrims && scrims.length > 0 ? (
            <div className="space-y-4">
              {scrims.map((scrim) => (
                <Card key={scrim.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-lg">
                              {scrim.matchType}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {scrim.map}
                            </div>
                          </div>
                          <Badge
                            variant={
                              scrim.status === "open" ? "default" : "secondary"
                            }
                          >
                            {scrim.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">
                              Entry Fee
                            </div>
                            <div className="flex items-center gap-1 font-mono font-semibold">
                              <IndianRupee size={14} />
                              <span>{scrim.entryFee}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Prize Pool
                            </div>
                            <div className="flex items-center gap-1 font-mono font-semibold">
                              <IndianRupee size={14} />
                              <span>{scrim.prizePool}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Date & Time
                            </div>
                            <div className="font-medium">
                              {scrim.date} {scrim.time}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Players</div>
                            <div className="flex items-center gap-1 font-medium">
                              <Users size={14} />
                              <span>
                                {scrim.spotsRemaining}/{scrim.maxPlayers}
                              </span>
                            </div>
                          </div>
                        </div>

                        {scrim.roomId && (
                          <div className="pt-2 border-t space-y-1">
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Room ID:
                              </span>{" "}
                              <code className="font-mono">{scrim.roomId}</code>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Password:
                              </span>{" "}
                              <code className="font-mono">
                                {scrim.roomPassword}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedScrim(scrim);
                            setRoomId(scrim.roomId || "");
                            setRoomPassword(scrim.roomPassword || "");
                            setYoutubeLink(scrim.youtubeLink || "");
                          }}
                          data-testid={`button-manage-${scrim.id}`}
                        >
                          Manage Room
                        </Button>

                        <div className="flex gap-2">
                          {scrim.status === "open" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(scrim.id, "live")
                              }
                              data-testid={`button-start-${scrim.id}`}
                            >
                              Start
                            </Button>
                          )}
                          {scrim.status === "live" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(scrim.id, "completed")
                              }
                              data-testid={`button-complete-${scrim.id}`}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteScrim(scrim.id)}
                            data-testid={`button-delete-${scrim.id}`}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
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
              <h3 className="text-lg font-semibold mb-2">No Scrims Created</h3>
              <p className="text-muted-foreground">
                Create your first scrim in the Create tab
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedScrim && (
        <Card>
          <CardHeader>
            <CardTitle>
              Update Room Details - {selectedScrim.matchType}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="mt-2"
                data-testid="input-room-id"
              />
            </div>

            <div>
              <Label htmlFor="roomPassword">Room Password</Label>
              <Input
                id="roomPassword"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-2"
                data-testid="input-room-password"
              />
            </div>

            <div>
              <Label htmlFor="youtubeLink">
                YouTube Stream Link (Optional)
              </Label>
              <Input
                id="youtubeLink"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://youtube.com/..."
                className="mt-2"
                data-testid="input-youtube-link"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateRoom} data-testid="button-save-room">
                Save Room Details
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedScrim(null);
                  setRoomId("");
                  setRoomPassword("");
                  setYoutubeLink("");
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

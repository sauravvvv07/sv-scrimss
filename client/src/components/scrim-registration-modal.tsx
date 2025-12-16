import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertCircle, IndianRupee, Wallet, CheckCircle } from "lucide-react";
import type { Scrim, User } from "@shared/schema";
import { AddMoneyModal } from "./add-money-modal";

interface ScrimRegistrationModalProps {
  scrim: Scrim;
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

type Mode = "solo" | "duo" | "squad";

const MODE_INFO: Record<Mode, { players: number; label: string }> = {
  solo: { players: 1, label: "Solo (1 player)" },
  duo: { players: 2, label: "Duo (2 players)" },
  squad: { players: 4, label: "Squad (4 players)" },
};

interface TeamMember {
  ign: string;
  playerId: string;
  userId?: number;
}

interface SuccessData {
  slotNumber: number;
  teamName: string;
  newBalance: number;
}

export function ScrimRegistrationModal({
  scrim,
  user,
  isOpen,
  onClose,
}: ScrimRegistrationModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<
    "mode" | "form" | "confirm" | "success" | "insufficient"
  >("mode");
  const [mode, setMode] = useState<Mode>("solo");
  const [teamName, setTeamName] = useState("");
  const [teammates, setTeammates] = useState<TeamMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedTeamProfile, setSavedTeamProfile] = useState<any>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [slotsStatus, setSlotsStatus] = useState<any>(null);

  const entryFeeAmount =
    parseFloat(scrim.entryFee.toString()) * MODE_INFO[mode].players;
  const userBalance = user.walletBalance
    ? parseFloat(user.walletBalance.toString())
    : 0;
  const hasEnoughBalance = userBalance >= entryFeeAmount;
  const shortfall = Math.max(0, entryFeeAmount - userBalance);

  useEffect(() => {
    if (!isOpen) return;
    apiRequest("GET", "/api/scrim/team-profile", {})
      .then((profile) => {
        setSavedTeamProfile(profile);
      })
      .catch(() => setSavedTeamProfile(null));

    apiRequest("GET", `/api/scrim/${scrim.id}/slots-status`, {})
      .then((status) => {
        setSlotsStatus(status);
      })
      .catch(() => setSlotsStatus(null));
  }, [isOpen, scrim.id]);

  const handleModeSelect = (selectedMode: Mode) => {
    const requiredSlots = MODE_INFO[selectedMode].players;
    if (parseFloat(scrim.spotsRemaining.toString()) < requiredSlots) {
      toast({
        title: "Not enough spots",
        description: `Only ${scrim.spotsRemaining} spot(s) remaining`,
        variant: "destructive",
      });
      return;
    }
    setMode(selectedMode);
    setTeammates([]);
    setTeamName("");

    // Check wallet balance before proceeding
    const fee = parseFloat(scrim.entryFee.toString()) * requiredSlots;
    if (userBalance < fee) {
      setStep("insufficient");
      return;
    }

    // Initialize teammates immediately
    const newTeammates: TeamMember[] = [];
    for (let i = 0; i < requiredSlots - 1; i++) {
      newTeammates.push({ ign: "", playerId: "" });
    }
    setTeammates(newTeammates);

    setStep("form");
  };

  // Removed initializeTeammates function and the useEffect that called it




  const isFormValid = (): boolean => {
    if (!teamName.trim() && mode !== "solo") {
      return false;
    }
    for (let i = 0; i < teammates.length; i++) {
      if (!teammates[i].ign.trim()) {
        return false;
      }
      if (!teammates[i].playerId.trim()) {
        return false;
      }
    }
    return true;
  };

  const validateForm = (): boolean => {
    if (!teamName.trim() && mode !== "solo") {
      toast({ title: "Team name required", variant: "destructive" });
      return false;
    }
    for (let i = 0; i < teammates.length; i++) {
      if (!teammates[i].ign.trim()) {
        toast({
          title: `Teammate ${i + 1} IGN required`,
          variant: "destructive",
        });
        return false;
      }
      if (!teammates[i].playerId.trim()) {
        toast({
          title: `Teammate ${i + 1} Player ID required`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    if (!hasEnoughBalance) {
      setStep("insufficient");
      return;
    }

    setIsSubmitting(true);
    try {
      const teamMembers: TeamMember[] = [
        { ign: user.username, playerId: user.playerId, userId: user.id },
        ...teammates,
      ];

      const response = await apiRequest("POST", "/api/scrim/register", {
        scrimId: scrim.id,
        mode,
        teamName: teamName || `${user.username}'s ${mode}`,
        teamMembers,
      });

      setSuccessData({
        slotNumber: response.slotNumber,
        teamName: response.registration.teamName || teamName,
        newBalance: response.newBalance,
      });
      setStep("success");
    } catch (error: any) {
      if (error.message?.includes("Insufficient")) {
        setStep("insufficient");
      }
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("mode");
    setMode("solo");
    setTeamName("");
    setTeammates([]);
    setSuccessData(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{scrim.matchType}</DialogTitle>
            <DialogDescription>
              {step === "mode" && "Choose your registration mode"}
              {step === "form" && `Fill in your ${mode} team details`}
              {step === "confirm" && "Review your registration"}
              {step === "insufficient" && "Add funds to your wallet"}
              {step === "success" && "Registration complete!"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* STEP: MODE SELECTION */}
            {step === "mode" && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Select Registration Mode
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {(["solo", "duo", "squad"] as Mode[]).map((m) => {
                    const info = MODE_INFO[m];
                    const requiredSlots = info.players;

                    // Determine availability based on slots status
                    let isDisabled = false;
                    let statusText = "";

                    // Global check for spots remaining
                    const globalSpotsRemaining = parseFloat(scrim.spotsRemaining.toString());
                    const hasGlobalSpots = globalSpotsRemaining >= requiredSlots;

                    if (!slotsStatus) {
                      // Fallback while loading
                      const availableSlots = Math.floor(
                        globalSpotsRemaining /
                          requiredSlots
                      );
                      isDisabled = availableSlots === 0;
                      statusText = `${availableSlots} available`;
                    } else {
                      // Solo/Duo use slots 99-100 (2 total)
                      if (m === "solo" || m === "duo") {
                        const soloDuoFilled =
                          (slotsStatus.soloCount || 0) +
                          (slotsStatus.duoCount || 0);
                        const soloDuoAvailable = Math.max(0, 2 - soloDuoFilled);
                        
                        // Disable if specific slots are full OR if global capacity is reached
                        isDisabled = soloDuoAvailable === 0 || !hasGlobalSpots;

                        statusText = isDisabled
                          ? "Slots filled"
                          : `${soloDuoAvailable} slot${
                              soloDuoAvailable !== 1 ? "s" : ""
                            } left`;
                      }
                      // Squad uses slots 1-98
                      else if (m === "squad") {
                        const squadSlotsAvailable = Math.floor(
                          globalSpotsRemaining / 4
                        );
                        isDisabled = squadSlotsAvailable === 0;
                        statusText = isDisabled
                          ? "Slots filled"
                          : `${squadSlotsAvailable} squad${
                              squadSlotsAvailable !== 1 ? "s" : ""
                            } can join`;
                      }
                    }

                    return (
                      <button
                        key={m}
                        onClick={() => !isDisabled && handleModeSelect(m)}
                        disabled={isDisabled}
                        className={`p-4 rounded-lg border-2 text-left transition ${
                          isDisabled
                            ? "border-muted bg-muted/50 opacity-50 cursor-not-allowed"
                            : "border-border hover-elevate active-elevate-2 cursor-pointer"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold capitalize">
                              {info.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Entry Fee: ₹
                              {(
                                parseFloat(scrim.entryFee.toString()) *
                                requiredSlots
                              ).toFixed(0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {statusText}
                            </p>
                            {isDisabled && (
                              <p className="text-xs text-destructive">Full</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP: INSUFFICIENT FUNDS */}
            {step === "insufficient" && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">
                    Insufficient Wallet Balance
                  </h3>
                  <p className="text-muted-foreground">
                    You don't have enough credit to register
                  </p>
                </div>

                <Card className="p-4 space-y-3 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                  <div>
                    <p className="text-xs text-red-900 dark:text-red-100 uppercase font-semibold">
                      Required
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                      <IndianRupee size={24} />
                      {entryFeeAmount.toFixed(0)}
                    </p>
                  </div>
                  <div className="border-t border-red-200 dark:border-red-800 pt-3">
                    <p className="text-xs text-red-900 dark:text-red-100 uppercase font-semibold">
                      Your Balance
                    </p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                      <IndianRupee size={18} />
                      {userBalance.toFixed(2)}
                    </p>
                  </div>
                  <div className="border-t border-red-200 dark:border-red-800 pt-3">
                    <p className="text-xs text-red-900 dark:text-red-100 uppercase font-semibold">
                      You Need
                    </p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                      <IndianRupee size={18} />
                      {shortfall.toFixed(2)} more
                    </p>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("mode")}
                  >
                    Choose Different Mode
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setShowAddMoneyModal(true)}
                    data-testid="button-add-money"
                  >
                    Add Money to Wallet
                  </Button>
                </div>
              </div>
            )}

            {/* STEP: TEAM FORM */}
            {step === "form" && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div>
                    <Label htmlFor="myIgn" className="text-sm">
                      Your IGN (Locked)
                    </Label>
                    <Input
                      id="myIgn"
                      value={user.username}
                      disabled
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="myId" className="text-sm">
                      Your Player ID (Locked)
                    </Label>
                    <Input
                      id="myId"
                      value={user.playerId}
                      disabled
                      className="mt-2"
                    />
                  </div>
                </div>

                {mode !== "solo" && (
                  <div>
                    <Label htmlFor="teamName" className="text-sm">
                      Team Name (Optional)
                    </Label>
                    <Input
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name"
                      className="mt-2"
                    />
                  </div>
                )}

                {teammates.map((tm, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-muted/30 rounded-lg space-y-3 border border-border"
                  >
                    <p className="font-semibold text-sm">Teammate {idx + 1}</p>
                    <div>
                      <Label htmlFor={`tm-ign-${idx}`} className="text-sm">
                        IGN
                      </Label>
                      <Input
                        id={`tm-ign-${idx}`}
                        value={tm.ign}
                        onChange={(e) => {
                          const updated = [...teammates];
                          updated[idx].ign = e.target.value;
                          setTeammates(updated);
                        }}
                        placeholder="Teammate IGN"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`tm-id-${idx}`} className="text-sm">
                        Player ID
                      </Label>
                      <Input
                        id={`tm-id-${idx}`}
                        value={tm.playerId}
                        onChange={(e) => {
                          const updated = [...teammates];
                          updated[idx].playerId = e.target.value;
                          setTeammates(updated);
                        }}
                        placeholder="Teammate Player ID"
                        className="mt-2"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("mode")}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep("confirm")}
                    disabled={!isFormValid()}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* STEP: CONFIRMATION */}
            {step === "confirm" && (
              <div className="space-y-6">
                <Card className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">
                      Mode
                    </p>
                    <p className="text-lg font-semibold capitalize">
                      {MODE_INFO[mode].label}
                    </p>
                  </div>
                  {teamName && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Team
                      </p>
                      <p className="text-lg font-semibold">{teamName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                      Members
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">• {user.username} (Captain)</p>
                      {teammates.map((tm, idx) => (
                        <p key={idx} className="font-medium">
                          • {tm.ign}
                        </p>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="p-4 space-y-2 border-primary/50 bg-primary/5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Entry Fee:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <IndianRupee size={16} />
                      {entryFeeAmount.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Current Balance:
                    </span>
                    <span className="font-mono">₹{userBalance.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center font-semibold">
                    <span>After Registration:</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee size={16} />
                      {(userBalance - entryFeeAmount).toFixed(2)}
                    </span>
                  </div>
                </Card>

                {hasEnoughBalance && (
                  <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-900 dark:text-green-100">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">
                        Ready to register!
                      </span>
                    </div>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("form")}
                  >
                    Edit
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleRegister}
                    disabled={isSubmitting || !hasEnoughBalance}
                    data-testid="button-confirm-register"
                  >
                    {isSubmitting ? "Registering..." : "Confirm & Register"}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP: SUCCESS */}
            {step === "success" && successData && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">
                    Registration Successful!
                  </h3>
                  <p className="text-muted-foreground">
                    Your credit has been deducted from wallet
                  </p>
                </div>

                <Card className="p-4 space-y-4 bg-primary/5 border-primary/50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">
                      Your Slot Number
                    </p>
                    <p className="text-4xl font-bold text-primary mt-2">
                      {successData.slotNumber}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scrim:</span>
                      <span className="font-semibold">{scrim.matchType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team:</span>
                      <span className="font-semibold">
                        {successData.teamName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Entry Fee Deducted:
                      </span>
                      <span className="font-semibold flex items-center gap-1">
                        <IndianRupee size={14} />
                        {entryFeeAmount.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 space-y-2 bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Wallet Update
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span>New Balance:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <IndianRupee size={16} />
                      {successData.newBalance.toFixed(2)}
                    </span>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleReset();
                      onClose();
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleReset();
                      queryClient.invalidateQueries({
                        queryKey: ["/api/scrims"],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["/api/wallet/balance"],
                      });
                    }}
                  >
                    Browse More Scrims
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Money Modal */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => {
          setShowAddMoneyModal(false);
          // After adding money, refresh user balance and stay in insufficient screen
          queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
        }}
      />
    </>
  );
}

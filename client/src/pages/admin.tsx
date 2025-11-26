import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateScrimPanel } from "@/components/admin/create-scrim-panel";
import { PaymentsPanel } from "@/components/admin/payments-panel";
import { PlayersPanel } from "@/components/admin/players-panel";
import { ScrimsManagement } from "@/components/admin/scrims-management";
import { Trophy, Users, Wallet, Settings } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground text-lg">Manage scrims, payments, and players</p>
      </div>

      <Tabs defaultValue="scrims" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="scrims" data-testid="tab-scrims">
            <Trophy size={18} className="mr-2" />
            Scrims
          </TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">
            <Wallet size={18} className="mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="players" data-testid="tab-players">
            <Users size={18} className="mr-2" />
            Players
          </TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">
            <Settings size={18} className="mr-2" />
            Create
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scrims">
          <ScrimsManagement />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsPanel />
        </TabsContent>

        <TabsContent value="players">
          <PlayersPanel />
        </TabsContent>

        <TabsContent value="create">
          <CreateScrimPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

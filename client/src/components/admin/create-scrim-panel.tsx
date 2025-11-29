import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const scrimSchema = z.object({
  scrimName: z.string().min(1, "Scrim name is required"),
  matchType: z.string().min(1, "Match type is required"),
  map: z.string().min(1, "Map is required"),
  entryFee: z.string().min(1, "Entry fee is required"),
  prizePool: z.string().min(1, "Prize pool is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  maxPlayers: z.number().min(1, "Max players must be at least 1"),
});

type ScrimForm = z.infer<typeof scrimSchema>;

export function CreateScrimPanel() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScrimForm>({
    resolver: zodResolver(scrimSchema),
    defaultValues: {
      scrimName: "",
      matchType: "",
      map: "",
      entryFee: "",
      prizePool: "",
      date: "",
      time: "",
      maxPlayers: 100,
    },
  });

  async function onSubmit(data: ScrimForm) {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/admin/scrims", data);

      toast({
        title: "Scrim created",
        description: "The scrim has been created successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/scrims"] });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Failed to create scrim",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Scrim/Tournament</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scrimName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scrim Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., scrim1, weekend_war"
                        data-testid="input-scrim-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="matchType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-match-type">
                          <SelectValue placeholder="Select match type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Squad TPP">Squad TPP</SelectItem>
                        <SelectItem value="Squad FPP">Squad FPP</SelectItem>
                        <SelectItem value="Duo TPP">Duo TPP</SelectItem>
                        <SelectItem value="Duo FPP">Duo FPP</SelectItem>
                        <SelectItem value="Solo TPP">Solo TPP</SelectItem>
                        <SelectItem value="Solo FPP">Solo FPP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="map"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-map">
                          <SelectValue placeholder="Select map" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Erangel">Erangel</SelectItem>
                        <SelectItem value="Miramar">Miramar</SelectItem>
                        <SelectItem value="Sanhok">Sanhok</SelectItem>
                        <SelectItem value="Vikendi">Vikendi</SelectItem>
                        <SelectItem value="Livik">Livik</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Fee (₹)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="50"
                        data-testid="input-entry-fee"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prizePool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prize Pool (₹)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="500"
                        data-testid="input-prize-pool"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" data-testid="input-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxPlayers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Players</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        data-testid="input-max-players"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="button-create-scrim"
            >
              {isSubmitting ? "Creating..." : "Create Scrim"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

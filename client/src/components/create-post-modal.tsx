import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const postSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(10).max(100),
  rank: z.string().min(1, "Rank is required"),
  device: z.string().min(1, "Device is required"),
  kd: z.string().min(1, "K/D is required"),
  playstyle: z.string().min(10, "Please describe your playstyle"),
  hasMic: z.boolean(),
});

type PostForm = z.infer<typeof postSchema>;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      name: "",
      age: 18,
      rank: "",
      device: "",
      kd: "",
      playstyle: "",
      hasMic: true,
    },
  });

  async function onSubmit(data: PostForm) {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/teammates", data);

      toast({
        title: "Post created",
        description: "Your teammate finder post is now live",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/teammates"] });

      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to create post",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Teammate Post</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-name" placeholder="Your name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      data-testid="input-age"
                      placeholder="Your age"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-rank">
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                      <SelectItem value="Diamond">Diamond</SelectItem>
                      <SelectItem value="Crown">Crown</SelectItem>
                      <SelectItem value="Ace">Ace</SelectItem>
                      <SelectItem value="Conqueror">Conqueror</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="device"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-device" placeholder="e.g., iPhone 14, OnePlus 11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>K/D Ratio</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-kd" placeholder="e.g., 3.5, 4.2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="playstyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Playstyle</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      data-testid="input-playstyle"
                      placeholder="Describe your playstyle (aggressive, passive, support, etc.)"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasMic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Microphone</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Do you have a working mic?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-mic"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit">
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

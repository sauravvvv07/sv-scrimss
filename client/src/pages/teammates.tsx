import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MessageCircle, Plus, Mic, MicOff } from "lucide-react";
import { CreatePostModal } from "@/components/create-post-modal";
import { ChatModal } from "@/components/chat-modal";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import type { TeammatesPost } from "@shared/schema";

export default function Teammates() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<TeammatesPost | null>(null);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const { data: posts, isLoading } = useQuery<TeammatesPost[]>({
    queryKey: ["/api/teammates"],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Teammates</h1>
          <p className="text-muted-foreground text-lg">Connect with players and build your squad</p>
        </div>
        <Button onClick={() => setShowCreatePost(true)} data-testid="button-create-post">
          <Plus size={18} className="mr-2" />
          Create Post
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post: any) => (
            <Card key={post.id} className="hover-elevate">
              <CardHeader>
                <CardTitle className="text-xl flex items-start justify-between gap-2">
                  <span>{post.name}</span>
                  <Badge variant="secondary">{post.age}Y</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rank:</span>
                    <div className="font-semibold">{post.rank}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">K/D:</span>
                    <div className="font-semibold font-mono">{post.kd}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Device:</span>
                    <div className="font-semibold">{post.device}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mic:</span>
                    <div className="flex items-center gap-1">
                      {post.hasMic ? (
                        <>
                          <Mic size={14} className="text-green-500" />
                          <span className="font-semibold">Yes</span>
                        </>
                      ) : (
                        <>
                          <MicOff size={14} className="text-muted-foreground" />
                          <span className="font-semibold">No</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Playstyle:</span>
                  <div className="mt-1">{post.playstyle}</div>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setSelectedPost(post)}
                  data-testid={`button-chat-${post.id}`}
                >
                  <MessageCircle size={18} className="mr-2" />
                  Chat
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
          <p className="text-muted-foreground mb-6">Be the first to create a teammate finder post</p>
          <Button onClick={() => setShowCreatePost(true)} data-testid="button-create-first">
            <Plus size={18} className="mr-2" />
            Create Post
          </Button>
        </Card>
      )}

      {showCreatePost && <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />}
      {selectedPost && <ChatModal post={selectedPost} isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );
}

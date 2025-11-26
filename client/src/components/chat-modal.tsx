import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { TeammatesPost, ChatMessage } from "@shared/schema";

interface ChatModalProps {
  post: TeammatesPost;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ post, isOpen, onClose }: ChatModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", postId: post.id }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "blocked") {
        toast({
          title: "Message blocked",
          description: "Your message contains inappropriate content",
          variant: "destructive",
        });
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [isOpen, post.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !ws) return;

    ws.send(
      JSON.stringify({
        type: "message",
        postId: post.id,
        message: newMessage,
      })
    );

    setNewMessage("");
  };

  const reportMessage = (messageId: number) => {
    if (!ws) return;

    ws.send(
      JSON.stringify({
        type: "report",
        messageId,
      })
    );

    toast({
      title: "Message reported",
      description: "Admin will review this message",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Chat with {post.name}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {post.rank} • K/D: {post.kd}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {messages.map((msg: any, index) => {
            const isOwnMessage = msg.userId === user?.id;
            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted mr-auto"
                  }`}
                >
                  <div className="text-sm break-words">{msg.message}</div>
                  <div className="text-xs opacity-70 mt-1 flex items-center justify-between gap-2">
                    <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    {!isOwnMessage && (
                      <button
                        onClick={() => reportMessage(msg.id)}
                        className="hover-elevate active-elevate-2 p-1 rounded"
                        data-testid={`button-report-${msg.id}`}
                      >
                        <AlertTriangle size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            data-testid="input-message"
          />
          <Button size="icon" onClick={sendMessage} data-testid="button-send">
            <Send size={18} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

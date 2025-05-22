import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Message, User } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { messageService } from "@/services/messageService";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { InboxMessages } from "./messages/inbox-messages";
import { SendMessage } from "./messages/send-message";

export function MessagingSystem() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("inbox");
  const [messages, setMessages] = useState<(Message & { sender?: User })[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch messages and enrich with sender data
        const receivedMessages = await messageService.getMessagesByReceiver(
          currentUser.id
        );

        // Get unique sender IDs
        const senderIds = [
          ...new Set(receivedMessages.map((msg) => msg.senderId)),
        ];

        // Fetch all users that have sent messages to current user
        const senders = await Promise.all(
          senderIds.map((id) => userService.getUserById(id).catch(() => null))
        );

        // Create a map of senders for quick lookup
        const sendersMap = new Map(
          senders.filter(Boolean).map((sender) => [sender!.id, sender!])
        );

        // Enrich messages with sender data
        const enrichedMessages = receivedMessages.map((msg) => ({
          ...msg,
          sender: sendersMap.get(msg.senderId),
        }));

        setMessages(enrichedMessages);

        // Fetch friends
        if (currentUser.friends && currentUser.friends.length > 0) {
          const friendData = await Promise.all(
            currentUser.friends.map((id) =>
              userService.getUserById(id).catch(() => null)
            )
          );

          setFriends(friendData.filter(Boolean) as User[]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      console.log("Marking message as read:", messageId);
      await messageService.markAsRead(messageId);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark message as read.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (receiverId: string, content: string) => {
    if (!currentUser) return false;

    try {
      await messageService.sendMessage({
        receiverId,
        senderId: currentUser.id,
        content,
      });

      toast({
        title: "Success",
        description: "Message sent successfully!",
      });

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);

      // Update local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      toast({
        title: "Success",
        description: "Message deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          Please log in to use the messaging system.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox">
            Inbox{" "}
            {!loading && messages.filter((m) => !m.read).length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {messages.filter((m) => !m.read).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="send">Send Message</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <InboxMessages
            messages={messages}
            loading={loading}
            onMarkAsRead={handleMarkAsRead}
            onDeleteMessage={handleDeleteMessage}
          />
        </TabsContent>

        <TabsContent value="send" className="mt-4">
          <SendMessage
            friends={friends}
            loading={loading}
            onSendMessage={handleSendMessage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

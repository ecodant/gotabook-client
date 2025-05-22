import { useState } from "react";
import { User } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SendMessageProps {
  friends: User[];
  loading: boolean;
  onSendMessage: (receiverId: string, content: string) => Promise<boolean>;
}

export function SendMessage({
  friends,
  loading,
  onSendMessage,
}: SendMessageProps) {
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sending, setSending] = useState(false);
  console.log("Selected friend:", selectedFriend);
  // Filter friends based on search term
  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = async () => {
    if (!selectedFriend || !messageContent.trim()) return;

    setSending(true);
    try {
      const success = await onSendMessage(selectedFriend.id, messageContent);
      if (success) {
        // Reset form after successful send
        setMessageContent("");
      }
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return <div className="text-center py-8">Loading friends...</div>;
  }

  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            You don't have any friends yet. Add friends to send messages.
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => (window.location.href = "#friends")}
          >
            Go to Friends Tab
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-0 lg:space-y-0 lg:grid lg:grid-cols-[300px_1fr] lg:gap-6">
      {/* Friends list */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Friends</CardTitle>
          <CardDescription>Select a friend to message</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search friends..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="px-4 py-2">
              {filteredFriends.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No friends found
                </p>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedFriend?.id === friend.id
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(friend.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Member since{" "}
                        {new Date(friend.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message compose area */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle>
            {selectedFriend ? (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedFriend
                      ? getInitials(selectedFriend.username)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <span>{selectedFriend.username}</span>
              </div>
            ) : (
              "New Message"
            )}
          </CardTitle>
          <CardDescription>
            {selectedFriend
              ? `Write a message to ${selectedFriend.username}`
              : "Select a friend from the list to send a message"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 px-6 pb-4 flex flex-col">
          <Textarea
            placeholder={
              selectedFriend
                ? "Type your message here..."
                : "Select a friend first"
            }
            className="flex-1 min-h-[400px] resize-none"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            disabled={!selectedFriend || sending}
          />
        </CardContent>
        <CardFooter className="pt-2">
          <Button
            className="ml-auto"
            onClick={handleSend}
            disabled={!selectedFriend || !messageContent.trim() || sending}
          >
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

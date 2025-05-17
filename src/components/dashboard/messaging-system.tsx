import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  date: string;
  read: boolean;
  sender?: {
    _id: string;
    username: string;
  };
  receiver?: {
    _id: string;
    username: string;
  };
};

type User = {
  _id: string;
  username: string;
  email: string;
  role: string;
};

export function MessagingSystem() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user._id) throw new Error("User not found");

        // Fetch users
        const usersResponse = await fetch(
          "http://localhost:8090/api/admin/users"
        );
        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        const usersData = await usersResponse.json();

        // Filter out current user
        setUsers(usersData.filter((u: User) => u._id !== user._id));

        // Fetch received messages
        const inboxResponse = await fetch(
          `http://localhost:8090/api/messages/receiver/${user._id}`
        );
        if (!inboxResponse.ok) throw new Error("Failed to fetch inbox");
        const inboxData = await inboxResponse.json();

        // Fetch sent messages
        const sentResponse = await fetch(
          `http://localhost:8090/api/messages/sender/${user._id}`
        );
        if (!sentResponse.ok) throw new Error("Failed to fetch sent messages");
        const sentData = await sentResponse.json();

        // Combine messages and add user details
        const allMessages = [...inboxData, ...sentData];

        // Add user details to messages
        const messagesWithUsers = allMessages.map((message: Message) => {
          const sender = usersData.find(
            (u: User) => u._id === message.senderId
          );
          const receiver = usersData.find(
            (u: User) => u._id === message.receiverId
          );
          return {
            ...message,
            sender,
            receiver,
          };
        });

        setMessages(messagesWithUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendMessage = async () => {
    if (!selectedReceiver || !messageContent.trim()) {
      alert("Please select a recipient and enter a message");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user._id) throw new Error("User not found");

      const response = await fetch("http://localhost:8090/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: user._id,
          receiverId: selectedReceiver,
          content: messageContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const newMessage = await response.json();

      // Add sender and receiver details to the new message
      const sender = users.find((u) => u._id === user._id) || {
        _id: user._id,
        username: user.username,
      };
      const receiver = users.find((u) => u._id === selectedReceiver);

      const messageWithUsers = {
        ...newMessage,
        sender,
        receiver,
      };

      // Add the new message to the messages list
      setMessages((prev) => [...prev, messageWithUsers]);

      // Reset form
      setSelectedReceiver("");
      setMessageContent("");

      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/messages/read/${messageId}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) throw new Error("Failed to mark message as read");

      // Update message status locally
      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId ? { ...message, read: true } : message
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const receivedMessages = messages.filter(
    (message) => message.receiverId === currentUser._id
  );
  const sentMessages = messages.filter(
    (message) => message.senderId === currentUser._id
  );
  const unreadMessages = receivedMessages.filter((message) => !message.read);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox">
            Inbox {unreadMessages.length > 0 && `(${unreadMessages.length})`}
          </TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6">
          {receivedMessages.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              Your inbox is empty.
            </div>
          ) : (
            <div className="space-y-4">
              {receivedMessages.map((message) => (
                <Card
                  key={message._id}
                  className={`${!message.read ? "border-primary" : ""}`}
                  onClick={() => {
                    if (!message.read) {
                      handleMarkAsRead(message._id);
                    }
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">
                          From: {message.sender?.username || "Unknown User"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.date).toLocaleString()}
                        </p>
                      </div>
                      {!message.read && (
                        <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                          New
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-muted rounded-md mt-2">
                      {message.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {sentMessages.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              You haven't sent any messages.
            </div>
          ) : (
            <div className="space-y-4">
              {sentMessages.map((message) => (
                <Card key={message._id}>
                  <CardContent className="pt-6">
                    <div className="mb-2">
                      <h3 className="font-semibold">
                        To: {message.receiver?.username || "Unknown User"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-md mt-2">
                      {message.content}
                    </div>
                    <div className="mt-2 text-xs text-right">
                      {message.read ? "Read" : "Unread"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="compose" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">New Message</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Recipient
                  </label>
                  <Select
                    value={selectedReceiver}
                    onValueChange={setSelectedReceiver}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Write your message here..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button
                onClick={handleSendMessage}
                disabled={!selectedReceiver || !messageContent.trim()}
              >
                Send Message
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

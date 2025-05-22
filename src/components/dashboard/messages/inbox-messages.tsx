import { useState } from "react";
import { Message, User } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface InboxMessagesProps {
  messages: (Message & { sender?: User })[];
  loading: boolean;
  onMarkAsRead: (messageId: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

export function InboxMessages({
  messages,
  loading,
  onMarkAsRead,
  onDeleteMessage,
}: InboxMessagesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<
    (Message & { sender?: User }) | null
  >(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter messages based on search term
  const filteredMessages = messages.filter((msg) => {
    const senderName = msg.sender?.username?.toLowerCase() || "";
    const content = msg.content.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return senderName.includes(searchLower) || content.includes(searchLower);
  });

  // Sort messages - unread first, then by date (newest first)
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleOpenMessage = async (message: Message & { sender?: User }) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);

    // Mark as read if not already read
    if (!message.read) {
      console.log("Marking Object:", message);
      await onMarkAsRead(message.id);
    }
  };

  const handleDeletePrompt = (message: Message & { sender?: User }) => {
    setSelectedMessage(message);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedMessage) {
      await onDeleteMessage(selectedMessage.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const formatMessageDate = (date: Date) => {
    const now = new Date();
    const msgDate = new Date(date);

    // If today, show time
    if (msgDate.toDateString() === now.toDateString()) {
      return msgDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If this year, show month and day
    if (msgDate.getFullYear() === now.getFullYear()) {
      return msgDate.toLocaleDateString([], { month: "short", day: "numeric" });
    }

    // Otherwise show full date
    return msgDate.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search messages..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {sortedMessages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {messages.length === 0
                ? "No messages in your inbox."
                : "No messages match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {sortedMessages.map((message) => (
              <Card
                key={message.id}
                className={`transition-colors ${
                  !message.read ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <CardHeader className="py-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(message.sender?.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {message.sender?.username || "Unknown User"}
                          {!message.read && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              New
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {formatMessageDate(message.date)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenMessage(message)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeletePrompt(message)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-0">
                  <p className="text-sm line-clamp-2">{message.content}</p>
                </CardContent>
                <CardFooter className="pt-3 pb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => handleOpenMessage(message)}
                  >
                    Read {!message.read && "& Mark as Read"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedMessage?.sender && (
                <Avatar>
                  <AvatarFallback>
                    {getInitials(selectedMessage.sender.username)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <DialogTitle>
                  {selectedMessage?.sender?.username || "Unknown User"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedMessage &&
                    new Date(selectedMessage.date).toLocaleString()}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this message?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

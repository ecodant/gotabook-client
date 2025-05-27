import { User } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";

interface MyFriendsProps {
  loading: boolean;
  myFriends: User[];
}

export function MyFriends({ loading, myFriends }: MyFriendsProps) {
  // Helper function to get user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading friends...</div>;
  }

  if (myFriends.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              You haven't added any friends yet. Check the suggestions tab or
              search for friends!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {myFriends.map((friend) => (
          <Card key={friend.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {getInitials(friend.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{friend.username}</CardTitle>
                  <CardDescription>
                    Member since{" "}
                    {new Date(friend.registrationDate).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Friend</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

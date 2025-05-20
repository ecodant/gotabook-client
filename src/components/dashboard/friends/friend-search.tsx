import { useState } from "react";
import { User } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";

interface FriendSearchProps {
  loading: boolean;
  allUsers: User[];
  currentUserFriends: string[];
  addingFriend: string | null;
  onAddFriend: (friendId: string) => Promise<void>;
}

export function FriendSearch({
  loading,
  allUsers,
  currentUserFriends,
  addingFriend,
  onAddFriend,
}: FriendSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users who are not already friends and match the search term
  const filteredUsers = allUsers.filter(
    (user) =>
      !currentUserFriends.includes(user.id) &&
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users by name..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-4">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No users found matching your search. Try a different name."
                  : "Type a username to search for potential friends."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[450px] pr-4">
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.username}</CardTitle>
                      <CardDescription>
                        Member since{" "}
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => onAddFriend(user.id)}
                    disabled={addingFriend === user.id}
                  >
                    {addingFriend === user.id ? (
                      "Adding..."
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" /> Add Friend
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

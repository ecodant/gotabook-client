import { User, Book, Rating } from "@/lib/types";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, UserPlus, BookOpen } from "lucide-react";

// Extend User type with similarity score properties
interface UserWithSimilarityScore extends User {
  similarityScore: number;
  commonBooks: number;
}

interface FriendSuggestionsProps {
  loading: boolean;
  friendSuggestions: UserWithSimilarityScore[];
  allUsersRatings: Record<string, (Rating & { book?: Book })[]>;
  addingFriend: string | null;
  onAddFriend: (friendId: string) => Promise<void>;
}

export function FriendSuggestions({
  loading,
  friendSuggestions,
  allUsersRatings,
  addingFriend,
  onAddFriend,
}: FriendSuggestionsProps) {
  // Helper function to get user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to categorize similarity score
  const getSimilarityLabel = (score: number) => {
    if (score >= 0.9) return "Very High";
    if (score >= 0.75) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">Loading suggestions...</div>
    );
  }

  if (friendSuggestions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              No friend suggestions available. Rate more books to get
              personalized suggestions!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {friendSuggestions.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
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
                <Badge variant="secondary" className="flex gap-1">
                  <Star className="h-3 w-3" />
                  <span>{getSimilarityLabel(user.similarityScore)} Match</span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm mb-2">
                You both rated{" "}
                <span className="font-medium">{user.commonBooks} books</span>{" "}
                with similar scores.
              </p>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {(allUsersRatings[user.id] || []).length} books rated
                </span>
              </div>
            </CardContent>

            <CardFooter>
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
  );
}

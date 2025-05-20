import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { ratingService } from "@/services/ratingService";
import { bookService } from "@/services/bookService";
import { User, Rating, Book } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { FriendSuggestions } from "./friends/friend-suggestions";
import { MyFriends } from "./friends/my-friends";
import { FriendSearch } from "./friends/friend-search";

interface UserWithSimilarityScore extends User {
  similarityScore: number;
  commonBooks: number;
}

export function UserFriends() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("suggestions");
  const [loading, setLoading] = useState(true);
  const [friendSuggestions, setFriendSuggestions] = useState<
    UserWithSimilarityScore[]
  >([]);
  const [myFriends, setMyFriends] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userRatings, setUserRatings] = useState<(Rating & { book?: Book })[]>(
    []
  );
  const [allUsersRatings, setAllUsersRatings] = useState<
    Record<string, (Rating & { book?: Book })[]>
  >({});
  const [addingFriend, setAddingFriend] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser?.id) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Fetch all users
      const usersData = await userService.getAllUsers();
      const usersList = Array.isArray(usersData) ? usersData : [usersData];

      // Get reader users excluding current user
      const readerUsers = usersList.filter(
        (user) => user.role === "READER" && user.id !== currentUser.id
      );

      setAllUsers(readerUsers);

      // Fetch current user's friends
      const friendIds = currentUser.friends || [];
      const friends = readerUsers.filter((user) => friendIds.includes(user.id));
      setMyFriends(friends);

      // Fetch current user's ratings
      const myRatings = await ratingService.getRatingsByUserId(currentUser.id);
      const myRatingsWithBooks = await Promise.all(
        myRatings.map(async (rating) => {
          try {
            const book = await bookService.getBookById(rating.bookId);
            return { ...rating, book };
          } catch {
            return rating;
          }
        })
      );
      setUserRatings(myRatingsWithBooks);

      // Get all other users' ratings
      const usersRatings: Record<string, (Rating & { book?: Book })[]> = {};

      // Only consider users who are not already friends
      const potentialFriends = readerUsers.filter(
        (user) => !friendIds.includes(user.id)
      );

      for (const user of potentialFriends) {
        const ratings = await ratingService.getRatingsByUserId(user.id);

        if (ratings.length > 0) {
          const ratingsWithBooks = await Promise.all(
            ratings.map(async (rating) => {
              try {
                const book = await bookService.getBookById(rating.bookId);
                return { ...rating, book };
              } catch {
                return rating;
              }
            })
          );
          usersRatings[user.id] = ratingsWithBooks;
        }
      }

      setAllUsersRatings(usersRatings);

      // Calculate similarity scores and suggest friends
      const suggestions = calculateFriendSuggestions(
        potentialFriends,
        myRatingsWithBooks,
        usersRatings
      );
      setFriendSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching friend data:", error);
      toast({
        title: "Error",
        description: "Failed to load friend data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFriendSuggestions = (
    users: User[],
    myRatings: (Rating & { book?: Book })[],
    allRatings: Record<string, (Rating & { book?: Book })[]>
  ): UserWithSimilarityScore[] => {
    const suggestions: UserWithSimilarityScore[] = [];

    for (const user of users) {
      const userRatings = allRatings[user.id] || [];
      if (!userRatings.length) continue;

      // Find books that both users have rated
      const myRatedBooks = new Map(myRatings.map((r) => [r.bookId, r]));
      const commonRatings: {
        book: string;
        rating1: number;
        rating2: number;
      }[] = [];

      userRatings.forEach((r2) => {
        const r1 = myRatedBooks.get(r2.bookId);
        if (r1) {
          commonRatings.push({
            book: r2.bookId,
            rating1: r1.rating,
            rating2: r2.rating,
          });
        }
      });

      // If there's at least one common book with similar rating, consider it a suggestion
      if (commonRatings.length > 0) {
        // Calculate average rating difference
        let totalDiff = 0;
        for (const item of commonRatings) {
          totalDiff += Math.abs(item.rating1 - item.rating2);
        }

        const avgDiff = totalDiff / commonRatings.length;
        const maxDiff = 4; // Max difference between ratings (5-1)
        const similarity = 1 - avgDiff / maxDiff;

        // Add to suggestions if similarity is good enough
        if (similarity >= 0.5) {
          // 50% similarity threshold
          suggestions.push({
            ...user,
            similarityScore: similarity,
            commonBooks: commonRatings.length,
          });
        }
      }
    }

    // Sort by similarity score (higher first)
    return suggestions.sort((a, b) => b.similarityScore - a.similarityScore);
  };

  const handleAddFriend = async (friendId: string) => {
    if (!currentUser) return;

    try {
      setAddingFriend(friendId);

      // Add friend to user's friends list
      const updatedFriends = [...(currentUser.friends || []), friendId];

      await userService.updateUser(currentUser.id, {
        friends: updatedFriends,
      });

      // Update local state
      const newFriend = allUsers.find((user) => user.id === friendId);
      if (newFriend) {
        setMyFriends((prev) => [...prev, newFriend]);
        setFriendSuggestions((prev) =>
          prev.filter((user) => user.id !== friendId)
        );
      }

      toast({
        title: "Friend added!",
        description: "You've successfully added a new friend.",
      });
    } catch (error) {
      console.error("Error adding friend:", error);
      toast({
        title: "Error",
        description: "Failed to add friend. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingFriend(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center p-8">
        Please log in to view friends and suggestions.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Friends & Suggestions</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="suggestions">Friend Suggestions</TabsTrigger>
          <TabsTrigger value="search">Search Friends</TabsTrigger>
          <TabsTrigger value="friends">
            My Friends ({myFriends.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-4 space-y-4">
          <FriendSuggestions
            loading={loading}
            friendSuggestions={friendSuggestions}
            allUsersRatings={allUsersRatings}
            addingFriend={addingFriend}
            onAddFriend={handleAddFriend}
          />
        </TabsContent>

        <TabsContent value="search" className="mt-4 space-y-4">
          <FriendSearch
            loading={loading}
            allUsers={allUsers}
            currentUserFriends={currentUser.friends || []}
            addingFriend={addingFriend}
            onAddFriend={handleAddFriend}
          />
        </TabsContent>

        <TabsContent value="friends" className="mt-4">
          <MyFriends loading={loading} myFriends={myFriends} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

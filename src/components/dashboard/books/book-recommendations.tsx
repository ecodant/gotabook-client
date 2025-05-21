import { useState, useEffect } from "react";
import { Book, Loan, Rating } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { BookCard } from "./book-card";
import { Skeleton } from "@/components/ui/skeleton";

interface BookRecommendationsProps {
  allBooks: Book[];
  userRatings: (Rating & { book?: Book })[];
  userLoans: Loan[];
  loading: boolean;
  onRequestLoan: (bookId: string, bookTitle: string) => Promise<any>;
  onRateBook: (
    bookId: string,
    rating: number,
    comment?: string
  ) => Promise<any>;
}

interface RecommendationGroup {
  title: string;
  books: Book[];
}

export function BookRecommendations({
  allBooks,
  userRatings,
  userLoans,
  loading,
  onRequestLoan,
  onRateBook,
}: BookRecommendationsProps) {
  const [recommendationGroups, setRecommendationGroups] = useState<
    RecommendationGroup[]
  >([]);
  const [processingRecommendations, setProcessingRecommendations] =
    useState(true);
  const { toast } = useToast();

  // Generate recommendations based on user's ratings
  useEffect(() => {
    if (!loading) {
      setProcessingRecommendations(true);

      try {
        generateRecommendations();
      } catch (error) {
        console.error("Error generating recommendations:", error);
      } finally {
        setProcessingRecommendations(false);
      }
    }
  }, [allBooks, userRatings, loading]);

  const generateRecommendations = () => {
    // If user hasn't rated any books, return empty
    if (userRatings.length === 0) {
      setRecommendationGroups([]);
      return;
    }

    // Find the books the user has already interacted with (rated or borrowed)
    const interactedBookIds = new Set([
      ...userRatings.map((rating) => rating.bookId),
      ...userLoans.map((loan) => loan.bookId),
    ]);

    // Filter to get only books the user hasn't interacted with
    const nonInteractedBooks = allBooks.filter(
      (book) => !interactedBookIds.has(book.id)
    );

    // Get highly rated categories and authors (ratings >= 4)
    const highlyRatedItems = userRatings
      .filter((rating) => rating.rating >= 4 && rating.book)
      .map((rating) => ({
        category: rating.book?.category || "",
        author: rating.book?.author || "",
        rating: rating.rating,
      }));

    // Count ratings per category and author to find most liked
    const categoryCounts = new Map<string, number>();
    const authorCounts = new Map<string, number>();

    highlyRatedItems.forEach((item) => {
      if (item.category) {
        categoryCounts.set(
          item.category,
          (categoryCounts.get(item.category) || 0) + 1
        );
      }
      if (item.author) {
        authorCounts.set(item.author, (authorCounts.get(item.author) || 0) + 1);
      }
    });

    // Sort to get top categories and authors
    const topCategories = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    const topAuthors = [...authorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Generate recommendation groups
    const groups: RecommendationGroup[] = [];

    // Recommend by same authors
    topAuthors.forEach((author) => {
      const authorBooks = nonInteractedBooks.filter(
        (book) => book.author === author
      );
      if (authorBooks.length > 0) {
        groups.push({
          title: `Books by ${author}`,
          books: authorBooks,
        });
      }
    });

    // Recommend by same categories
    topCategories.forEach((category) => {
      const categoryBooks = nonInteractedBooks.filter(
        (book) =>
          book.category === category &&
          // Exclude books already recommended by author
          !groups.some((g) => g.books.some((b) => b.id === book.id))
      );

      if (categoryBooks.length > 0) {
        groups.push({
          title: `More ${category} Books`,
          books: categoryBooks,
        });
      }
    });

    // Add popular books section if we have recommendations
    if (groups.length > 0) {
      // Get popular books (highest rated that user hasn't interacted with)
      const highlyRatedBooks = nonInteractedBooks
        .filter(
          (book) =>
            book.averageRating >= 4 &&
            !groups.some((g) => g.books.some((b) => b.id === book.id))
        )
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 6);

      if (highlyRatedBooks.length > 0) {
        groups.push({
          title: "Popular Books You Might Like",
          books: highlyRatedBooks,
        });
      }
    }

    setRecommendationGroups(groups);
  };

  const handleLoanRequest = async (bookId: string, bookTitle: string) => {
    try {
      const result = await onRequestLoan(bookId, bookTitle);

      if (result.status === "WAITING") {
        toast({
          title: "Added to waitlist",
          description: "You've been added to the waitlist for this book.",
        });
      } else if (result.status === "ACTIVE") {
        toast({
          title: "Book borrowed",
          description: "You've successfully borrowed this book!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request loan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRating = async (
    bookId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      await onRateBook(bookId, rating, comment);
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this book!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || processingRecommendations) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-[250px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (userRatings.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">
          No Recommendations Available
        </h3>
        <p className="text-muted-foreground">
          Rate some books to get personalized recommendations based on your
          preferences.
        </p>
      </div>
    );
  }

  if (recommendationGroups.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">
          We're Still Learning Your Preferences
        </h3>
        <p className="text-muted-foreground">
          Rate more books with higher scores to get personalized
          recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {recommendationGroups.map((group, index) => (
        <div key={index} className="space-y-4">
          <h2 className="text-xl font-semibold">{group.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isLoaned={userLoans.some(
                  (loan) => loan.bookId === book.id && loan.status === "ACTIVE"
                )}
                onLoanRequest={handleLoanRequest}
                onRate={handleRating}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

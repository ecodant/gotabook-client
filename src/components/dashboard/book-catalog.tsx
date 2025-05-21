import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bookService } from "@/services/bookService";
import { loanService } from "@/services/loanService";
import { ratingService } from "@/services/ratingService";
import { useAuth } from "@/hooks/useAuth";
import { Book, Loan, Rating } from "@/lib/types";
import { AllBooks } from "./books/all-books";
import { BookRecommendations } from "./books/book-recommendations";

export function BookCatalog() {
  const { currentUser } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [userRatings, setUserRatings] = useState<(Rating & { book?: Book })[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all-books");

  useEffect(() => {
    const fetchBooksAndUserData = async () => {
      try {
        setLoading(true);

        // Fetch all books
        const allBooks = await bookService.getAllBooks();
        const processedBooks = allBooks
          .filter((book) => book && book.id)
          .map((book) => ({
            ...book,
            averageRating: book.averageRating ?? 0,
          }));

        setBooks(processedBooks);

        // Fetch user's loans and ratings if user is logged in
        if (currentUser) {
          // Get user loans
          const loans = await loanService.getUserLoans(currentUser.id);
          setUserLoans(loans);

          // Get user ratings with book details
          const ratings = await ratingService.getRatingsByUserId(
            currentUser.id
          );
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
          setUserRatings(ratingsWithBooks);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooksAndUserData();
  }, [currentUser]);

  const handleRequestLoan = async (bookId: string, bookTitle: string) => {
    try {
      if (!currentUser) throw new Error("User not logged in");

      const userId = currentUser.id;

      // Create a loan via the API
      const newLoan = await loanService.requestLoan({
        bookId,
        userId,
        bookTitle,
      });

      // Update local state based on the response
      if (newLoan.status === "ACTIVE") {
        // Update book status locally
        setBooks((prevBooks) =>
          prevBooks.map((b) =>
            b.id === bookId ? { ...b, status: "BORROWED" } : b
          )
        );
        setUserLoans((prev) => [...prev, newLoan]);
      } else if (newLoan.status === "WAITING") {
        setUserLoans((prev) => [...prev, newLoan]);
      }

      return newLoan;
    } catch (error) {
      console.error("Error requesting loan:", error);
      throw error;
    }
  };

  const handleRateBook = async (
    bookId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      if (!currentUser) throw new Error("User not logged in");

      const userId = currentUser.id;

      // Create a new rating
      const newRating = await ratingService.createRating({
        bookId,
        userId,
        rating,
        comment,
      });

      // Find the rated book to add to the rating
      const ratedBook = books.find((book) => book.id === bookId);

      // Update state with new rating
      setUserRatings((prev) => [...prev, { ...newRating, book: ratedBook }]);

      return newRating;
    } catch (error) {
      console.error("Error rating book:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-books">All Books</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="all-books" className="mt-4">
          <AllBooks
            books={books}
            userLoans={userLoans}
            loading={loading}
            onRequestLoan={handleRequestLoan}
            onRateBook={handleRateBook}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <BookRecommendations
            allBooks={books}
            userRatings={userRatings}
            userLoans={userLoans}
            loading={loading}
            onRequestLoan={handleRequestLoan}
            onRateBook={handleRateBook}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

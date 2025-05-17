import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { StarRating } from "./star-rating";
import { loanService } from "@/services/loanService";
import { bookService } from "@/services/bookService";
import { useAuth } from "@/hooks/useAuth";
import { Book } from "@/lib/types";
import { ratingService } from "@/services/ratingService";

export function BookCatalog() {
  const { currentUser } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const allBooks = await bookService.getAllBooks();
        const processedBooks = allBooks
          .filter((book) => book && book.id) // Ensure valid books
          .map((book) => ({
            ...book,
            averageRating: book.averageRating ?? 0,
          }));
        console.log("Fetched books:", processedBooks); // Debugging line
        setBooks(processedBooks);
        setFilteredBooks(processedBooks);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (!loading) {
      let result = books;

      // Apply search filter
      if (searchTerm) {
        result = result.filter((book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply category filter
      if (categoryFilter) {
        result = result.filter((book) => book.category === categoryFilter);
      }

      setFilteredBooks(result);
    }
  }, [searchTerm, categoryFilter, books, loading]);

  const handleRequestLoan = async (bookId: string) => {
    try {
      if (!currentUser) throw new Error("User not logged in");

      const userId = currentUser.id;

      // Fetch the book details
      const book = await bookService.getBookById(bookId);

      if (book.status === "AVAILABLE") {
        // Create a loan with status "BORROWED"
        await loanService.requestLoan({ bookId, userId });

        // Update book status locally
        setBooks((prevBooks) =>
          prevBooks.map((b) =>
            b.id === bookId ? { ...b, status: "BORROWED" } : b
          )
        );

        alert("Book borrowed successfully!");
      } else {
        alert("Book is not available for borrowing.");
      }
    } catch (error) {
      console.error("Error requesting loan:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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

      // Create a new rating using the ratingService
      await ratingService.createRating({
        bookId,
        userId,
        rating,
        comment,
      });

      alert("Thank you for rating the book!");
    } catch (error) {
      console.error("Error rating book:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  if (loading) {
    return <div>Loading books...</div>;
  }

  if (filteredBooks.length === 0) {
    return <div>No books available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or author..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          No books found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="flex flex-col">
              <CardContent className="flex-1 pt-6">
                <h3 className="text-lg font-semibold line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  by {book.author}
                </p>
                <div className="flex items-center mt-2 mb-1">
                  <StarRating rating={book.averageRating} readOnly />
                  <span className="text-sm ml-2">
                    {book.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Year:</span>
                    <span className="text-sm">{book.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Category:</span>
                    <span className="text-sm">{book.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span
                      className={`text-sm ${
                        book.status === "AVAILABLE"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {book.status}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    const userRating = prompt("Rate this book (1-5):");
                    const userComment = prompt("Leave a comment (optional):");
                    if (userRating) {
                      handleRateBook(
                        book.id,
                        parseInt(userRating, 10),
                        userComment || undefined
                      );
                    }
                  }}
                >
                  Rate
                </Button>
                <Button
                  disabled={book.status !== "AVAILABLE"}
                  onClick={() => handleRequestLoan(book.id)}
                >
                  {book.status === "AVAILABLE" ? "Borrow" : "Unavailable"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

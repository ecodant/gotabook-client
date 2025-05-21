import { useState } from "react";
import { Book, Loan } from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { BookCard } from "./book-card";

interface AllBooksProps {
  books: Book[];
  userLoans: Loan[];
  loading: boolean;
  onRequestLoan: (bookId: string, bookTitle: string) => Promise<any>;
  onRateBook: (
    bookId: string,
    rating: number,
    comment?: string
  ) => Promise<any>;
}

export function AllBooks({
  books,
  userLoans,
  loading,
  onRequestLoan,
  onRateBook,
}: AllBooksProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { toast } = useToast();

  // Get unique categories for filtering
  const categories = [...new Set(books.map((book) => book.category))].sort();

  // Filter books based on search term and category
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  if (loading) {
    return <div className="flex justify-center py-8">Loading books...</div>;
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
        <div className="w-full sm:w-auto">
          <select
            className="w-full h-10 px-3 border rounded-md"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          No books found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
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
      )}
    </div>
  );
}

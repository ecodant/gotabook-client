import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rating, Book, Loan } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { ratingService } from "@/services/ratingService";
import { loanService } from "@/services/loanService";
import { bookService } from "@/services/bookService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function RatingSystem() {
  const { currentUser } = useAuth();
  const [userRatings, setUserRatings] = useState<(Rating & { book?: Book })[]>(
    []
  );
  const [booksToRate, setBooksToRate] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rate");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRating, setEditingRating] = useState<
    (Rating & { book?: Book }) | null
  >(null);
  const [editRatingValue, setEditRatingValue] = useState(0);
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;

      try {
        setIsLoading(true);

        // Fetch user's ratings with books
        const ratings = await ratingService.getRatingsByUserId(currentUser.id);
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

        // Fetch books available for rating
        const loans = await loanService.getUserLoans(currentUser.id);
        const returnedLoans = loans.filter(
          (loan: Loan) => loan.status === "RETURNED"
        );
        const bookIds = [
          ...new Set(returnedLoans.map((loan: Loan) => loan.bookId)),
        ];

        const books = await Promise.all(
          bookIds.map((id) => bookService.getBookById(id).catch(() => null))
        );

        const unratedBooks = books.filter(
          (book): book is Book =>
            book !== null && !ratings.some((r) => r.bookId === book.id)
        );
        setBooksToRate(unratedBooks);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleSubmitRating = async () => {
    if (!selectedBook || ratingValue === 0 || !currentUser?.id) {
      toast({
        title: "Error",
        description: "Please select a book and provide a rating.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newRating = await ratingService.createRating({
        bookId: selectedBook.id,
        userId: currentUser.id,
        rating: ratingValue,
        comment: comment || undefined,
      });

      // Add the new rating to userRatings with book data
      setUserRatings((prev) => [
        ...prev,
        {
          ...newRating,
          book: selectedBook,
        },
      ]);

      // Remove the book from booksToRate
      setBooksToRate((prev) =>
        prev.filter((book) => book.id !== selectedBook.id)
      );

      // Reset form
      setSelectedBook(null);
      setRatingValue(0);
      setComment("");

      toast({
        title: "Success",
        description: "Rating submitted successfully!",
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (rating: Rating & { book?: Book }) => {
    setEditingRating(rating);
    setEditRatingValue(rating.rating);
    setEditComment(rating.comment || "");
    setIsEditDialogOpen(true);
  };

  const handleEditRating = async () => {
    if (!editingRating) return;

    try {
      // Update the rating via the API with only the fields that can be changed
      const updatedRating = await ratingService.updateRating(editingRating.id, {
        rating: editRatingValue,
        comment: editComment || undefined,
      });

      // Update the userRatings state with the new data
      setUserRatings((prev) =>
        prev.map((rating) =>
          rating.id === editingRating.id
            ? {
                ...rating,
                rating: editRatingValue,
                comment: editComment || undefined,
              }
            : rating
        )
      );

      toast({
        title: "Success",
        description: "Rating updated successfully!",
      });

      // Close dialog and reset state
      setIsEditDialogOpen(false);
      setEditingRating(null);
    } catch (error) {
      console.error("Error updating rating:", error);
      toast({
        title: "Error",
        description: "Failed to update rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading ratings...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rate">Rate Books</TabsTrigger>
          <TabsTrigger value="my-ratings">
            My Ratings ({userRatings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rate" className="mt-6">
          {booksToRate.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              You don't have any books to rate. Borrow and return books to rate
              them.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {booksToRate.map((book) => (
                  <Card
                    key={book.id}
                    className={`cursor-pointer transition-all ${
                      selectedBook?.id === book.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedBook(book)}
                  >
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {book.author}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedBook && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="text-lg font-semibold">
                      Rate "{selectedBook.title}"
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <StarRating
                          rating={ratingValue}
                          onRatingChange={setRatingValue}
                          maxRating={5}
                        />
                        <span className="ml-2 text-sm">
                          {ratingValue > 0
                            ? `${ratingValue} stars`
                            : "Select rating"}
                        </span>
                      </div>

                      <Textarea
                        placeholder="Write your review (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedBook(null);
                        setRatingValue(0);
                        setComment("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitRating}
                      disabled={ratingValue === 0}
                    >
                      Submit Rating
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-ratings" className="mt-6">
          {userRatings.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              You haven't rated any books yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRatings.map((rating) => (
                <Card key={rating.id}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold">
                      {rating.book?.title || "Unknown Book"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      by {rating.book?.author || "Unknown Author"}
                    </p>

                    <div className="flex items-center mt-4">
                      <StarRating rating={rating.rating} readOnly />
                      <span className="ml-2 text-sm">
                        {rating.rating} stars
                      </span>
                    </div>

                    {rating.comment && (
                      <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                        "{rating.comment}"
                      </div>
                    )}

                    <div className="mt-4 text-xs text-muted-foreground">
                      Rated on {new Date(rating.date).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openEditDialog(rating)}
                    >
                      Edit Rating
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Rating Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Rating</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <h3 className="text-lg font-semibold">
              {editingRating?.book?.title || "Unknown Book"}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <StarRating
                  rating={editRatingValue}
                  onRatingChange={setEditRatingValue}
                  maxRating={5}
                />
                <span className="ml-2 text-sm">{editRatingValue} stars</span>
              </div>

              <Textarea
                placeholder="Write your review (optional)"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditRating} disabled={editRatingValue === 0}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

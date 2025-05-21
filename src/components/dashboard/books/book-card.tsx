import { useState } from "react";
import { Book } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "../star-rating";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface BookCardProps {
  book: Book;
  isLoaned: boolean;
  onLoanRequest: (bookId: string, bookTitle: string) => Promise<void>;
  onRate: (bookId: string, rating: number, comment?: string) => Promise<void>;
}

export function BookCard({
  book,
  isLoaned,
  onLoanRequest,
  onRate,
}: BookCardProps) {
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState("");
  const [isRating, setIsRating] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);

  const handleLoanRequest = async () => {
    try {
      setIsBorrowing(true);
      await onLoanRequest(book.id, book.title);
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleRateSubmit = async () => {
    if (ratingValue === 0) return;

    try {
      setIsRating(true);
      await onRate(book.id, ratingValue, comment || undefined);
      setIsRatingDialogOpen(false);

      // Reset form
      setRatingValue(0);
      setComment("");
    } finally {
      setIsRating(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardContent className="flex-1 pt-6">
          <h3 className="text-lg font-semibold line-clamp-1">{book.title}</h3>
          <p className="text-sm text-muted-foreground">by {book.author}</p>
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
          <Button variant="outline" onClick={() => setIsRatingDialogOpen(true)}>
            Rate
          </Button>
          <Button
            disabled={isLoaned || isBorrowing}
            onClick={handleLoanRequest}
          >
            {isBorrowing
              ? "Processing..."
              : book.status === "AVAILABLE"
              ? "Borrow"
              : "Join Waitlist"}
          </Button>
        </CardFooter>
      </Card>

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate "{book.title}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Rating</label>
              <div className="flex items-center">
                <StarRating
                  rating={ratingValue}
                  onRatingChange={setRatingValue}
                  maxRating={5}
                />
                <span className="ml-2 text-sm">
                  {ratingValue > 0 ? `${ratingValue} stars` : "Select rating"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Your Review (Optional)
              </label>
              <Textarea
                placeholder="Share your thoughts about this book..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleRateSubmit}
              disabled={ratingValue === 0 || isRating}
            >
              {isRating ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useEffect, useState } from "react";
import { loanService } from "@/services/loanService";
import { bookService } from "@/services/bookService";
import { Book } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
interface WaitlistEntry {
  book: Book;
  position: number;
}

const UserWaitlists = () => {
  const { currentUser } = useAuth();
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        if (!currentUser) throw new Error("User not logged in");

        // Fetch all loans for the current user
        const userLoans = await loanService.getUserLoans(currentUser.id);

        // Filter loans with status "WAITING"
        const waitingLoans = userLoans.filter(
          (loan) => loan.status === "WAITING"
        );

        const entries: WaitlistEntry[] = [];

        for (const loan of waitingLoans) {
          // Fetch the loan queue for the book
          const loanQueue = await loanService.getLoanQueue(loan.bookId);

          // Determine the position of the current user's loan in the queue
          const position =
            loanQueue.findIndex((entry) => entry.userId === currentUser.id) + 1;

          // Fetch book details
          const book = await bookService.getBookById(loan.bookId);

          entries.push({ book, position });
        }

        setWaitlistEntries(entries);
      } catch (error) {
        console.error("Failed to fetch waitlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlist();
  }, [currentUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Your Waitlist</h1>
      {waitlistEntries.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          You are not in any waitlist.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {waitlistEntries.map((entry, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h2 className="text-lg font-bold">{entry.book.title}</h2>
              <p>Author: {entry.book.author}</p>
              <p>Category: {entry.book.category}</p>
              <p>Your Position in Queue: {entry.position}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserWaitlists;

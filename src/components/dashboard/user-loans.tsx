import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { loanService } from "@/services/loanService";
import { Loan } from "@/lib/types";

export const UserLoans = () => {
  const { currentUser } = useAuth();
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [returnedLoans, setReturnedLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLoans = async () => {
      try {
        if (!currentUser) throw new Error("User not logged in");

        // Fetch loans for the current user
        const userLoans = await loanService.getUserLoans(currentUser.id);

        // Separate active and returned loans
        const active = userLoans.filter((loan) => loan.status === "BORROWED");
        const returned = userLoans.filter((loan) => loan.status === "RETURNED");

        setActiveLoans(active);
        setReturnedLoans(returned);
      } catch (error) {
        console.error("Failed to fetch user loans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLoans();
  }, [currentUser]);

  const handleReturnBook = async (loanId: string) => {
    try {
      // Perform the return operation
      await loanService.returnBook(loanId);

      // Update the loan lists
      setActiveLoans((prevLoans) =>
        prevLoans.filter((loan) => loan.id !== loanId)
      );
      const returnedLoan = activeLoans.find((loan) => loan.id === loanId);
      if (returnedLoan) {
        setReturnedLoans((prevLoans) => [
          ...prevLoans,
          { ...returnedLoan, status: "RETURNED" },
        ]);
      }
    } catch (error) {
      console.error("Failed to return book:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <TabsList>
        <TabsTrigger value="active">
          Active Loans ({activeLoans.length})
        </TabsTrigger>
        <TabsTrigger value="history">
          Loan History ({returnedLoans.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-6">
        {activeLoans.length === 0 ? (
          <div className="text-center p-8 border rounded-lg">
            You don't have any active loans.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeLoans.map((loan) => (
              <Card key={loan.id}>
                <CardContent>
                  <div>
                    <h3>{loan.bookId}</h3>
                    <p>
                      Loan Date: {new Date(loan.loanDate).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    className="w-full"
                    onClick={() => handleReturnBook(loan.id)}
                  >
                    Return Book
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        {returnedLoans.length === 0 ? (
          <div className="text-center p-8 border rounded-lg">
            You don't have any loan history.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {returnedLoans.map((loan) => (
              <Card key={loan.id}>
                <CardContent>
                  <div>
                    <h3>{loan.bookId}</h3>
                    <p>
                      Return Date:{" "}
                      {new Date(loan.returnDate!).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </div>
  );
};

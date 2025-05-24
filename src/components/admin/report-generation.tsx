import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Users, BookOpen, GitBranch } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { statsService } from "@/services/statsService";

export function ReportGeneration() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [userId1, setUserId1] = useState<string>("");
  const [userId2, setUserId2] = useState<string>("");
  const [loanUserId, setLoanUserId] = useState<string>("");
  const { toast } = useToast();

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleUserLoanStats = async () => {
    if (!loanUserId) {
      toast({
        title: "Missing user ID",
        description: "Please enter a user ID to get loan statistics.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading("userLoans");
      const data = await statsService.getUserLoanStats(loanUserId);
      downloadBlob(data, `user_loan_stats_${loanUserId}.txt`);

      toast({
        title: "Report downloaded",
        description: "Loan statistics report has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading user loan stats:", error);
      toast({
        title: "Download failed",
        description:
          "There was an error downloading the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleMostRatedBooks = async () => {
    try {
      setLoading("mostRated");
      const data = await statsService.getMostRatedBooks(10);
      downloadBlob(data, "most_rated_books.txt");

      toast({
        title: "Report downloaded",
        description: "Most rated books report has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading most rated books:", error);
      toast({
        title: "Download failed",
        description:
          "There was an error downloading the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleReadersWithMostFriends = async () => {
    try {
      setLoading("mostFriends");
      const data = await statsService.getReadersWithMostFriends(10);
      downloadBlob(data, "readers_with_most_friends.txt");

      toast({
        title: "Report downloaded",
        description: "Readers with most friends report has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading readers with most friends:", error);
      toast({
        title: "Download failed",
        description:
          "There was an error downloading the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleShortestPath = async () => {
    if (!userId1 || !userId2) {
      toast({
        title: "Missing user IDs",
        description: "Please enter both user IDs to find the shortest path.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading("shortestPath");
      const data = await statsService.getShortestPath(userId1, userId2);
      downloadBlob(data, "shortest_path.txt");

      toast({
        title: "Report downloaded",
        description: "Shortest path report has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading shortest path:", error);
      toast({
        title: "Download failed",
        description:
          "There was an error downloading the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
          <CardDescription>
            Download user-related statistics reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">User Loan Statistics</h3>
                <p className="text-sm text-muted-foreground">
                  View statistics about a user's book loans and reading habits.
                </p>
              </div>
            </div>
            <div className="space-y-3 mt-3">
              <Input
                placeholder="Enter User ID"
                value={loanUserId}
                onChange={(e) => setLoanUserId(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={handleUserLoanStats}
                disabled={loading === "userLoans" || !loanUserId}
              >
                {loading === "userLoans" ? (
                  "Downloading..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" /> Download Report
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Users with Most Friends</h3>
                <p className="text-sm text-muted-foreground">
                  List of users with the most connections in the platform.
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleReadersWithMostFriends}
              disabled={loading === "mostFriends"}
            >
              {loading === "mostFriends" ? (
                "Downloading..."
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Download Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Book Statistics</CardTitle>
          <CardDescription>
            Download book-related statistics reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Most Rated Books</h3>
                <p className="text-sm text-muted-foreground">
                  List of the most frequently rated books in the library.
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleMostRatedBooks}
              disabled={loading === "mostRated"}
            >
              {loading === "mostRated" ? (
                "Downloading..."
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Download Report
                </>
              )}
            </Button>
          </div>

          <div className="p-4 border rounded-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Shortest Connection Path</h3>
                <p className="text-sm text-muted-foreground">
                  Find the shortest connection path between two users.
                </p>
              </div>
            </div>
            <div className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="User ID 1"
                  value={userId1}
                  onChange={(e) => setUserId1(e.target.value)}
                />
                <Input
                  placeholder="User ID 2"
                  value={userId2}
                  onChange={(e) => setUserId2(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleShortestPath}
                disabled={loading === "shortestPath" || !userId1 || !userId2}
              >
                {loading === "shortestPath" ? (
                  "Downloading..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" /> Generate Path Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

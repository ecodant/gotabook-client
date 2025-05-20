import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Rating, Book } from "@/lib/types";
import { userService } from "@/services/userService";
import { ratingService } from "@/services/ratingService";
import { bookService } from "@/services/bookService";
import { RefreshCw, Info } from "lucide-react";
import ForceGraph2D from "react-force-graph-2d";

interface GraphNode {
  id: string;
  name: string;
  val: number;
  group: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function AffinityGraph() {
  const [users, setUsers] = useState<User[]>([]);
  const [ratings, setRatings] = useState<(Rating & { book?: Book })[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarityThreshold, setSimilarityThreshold] = useState("0.8");
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const graphRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && users.length > 0 && ratings.length > 0) {
      generateGraphData();
    }
  }, [loading, similarityThreshold]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const usersData = await userService.getAllUsers();
      const usersList = Array.isArray(usersData) ? usersData : [usersData];
      const readerUsers = usersList.filter((user) => user.role === "READER");
      setUsers(readerUsers);

      const allRatings: Rating[] = [];
      for (const user of readerUsers) {
        const userRatings = await ratingService.getRatingsByUserId(user.id);
        allRatings.push(...userRatings);
      }

      const uniqueRatings = Array.from(
        new Map(allRatings.map((rating) => [rating.id, rating])).values()
      );

      const ratingsWithBooks = await Promise.all(
        uniqueRatings.map(async (rating) => {
          try {
            const book = await bookService.getBookById(rating.bookId);
            return { ...rating, book };
          } catch {
            return rating;
          }
        })
      );

      setRatings(ratingsWithBooks);
    } catch (error) {
      console.error("Error fetching data for affinity graph:", error);
      toast({
        title: "Error",
        description:
          "Failed to load data for the affinity graph. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSimilarity = (userId1: string, userId2: string) => {
    const user1Ratings = ratings.filter((r) => r.userId === userId1);
    const user2Ratings = ratings.filter((r) => r.userId === userId2);

    if (user1Ratings.length === 0 || user2Ratings.length === 0) return 0;

    const user1Books = new Map(user1Ratings.map((r) => [r.bookId, r]));
    const commonRatings: { book: string; rating1: number; rating2: number }[] =
      [];

    user2Ratings.forEach((r2) => {
      const r1 = user1Books.get(r2.bookId);
      if (r1) {
        commonRatings.push({
          book: r2.bookId,
          rating1: r1.rating,
          rating2: r2.rating,
        });
      }
    });

    if (commonRatings.length === 0) return 0;

    let totalDiff = 0;
    for (const item of commonRatings) {
      totalDiff += Math.abs(item.rating1 - item.rating2);
    }

    const avgDiff = totalDiff / commonRatings.length;
    const maxDiff = 4;
    const similarity = 1 - avgDiff / maxDiff;

    return similarity * Math.min(1, commonRatings.length / 3);
  };

  const generateGraphData = () => {
    const threshold = parseFloat(similarityThreshold);

    const nodes: GraphNode[] = users.map((user, idx) => ({
      id: user.id,
      name: user.username,
      val: 1 + ratings.filter((r) => r.userId === user.id).length / 5,
      group: idx % 5,
    }));

    const links: GraphLink[] = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const similarity = calculateSimilarity(users[i].id, users[j].id);

        if (similarity >= threshold) {
          links.push({
            source: users[i].id,
            target: users[j].id,
            value: similarity * 10,
          });
        }
      }
    }

    setGraphData({ nodes, links });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reader Affinity Analysis</CardTitle>
          <CardDescription>
            Visualize relationships between readers based on similar book rating
            patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">
                Similarity Threshold
              </label>
              <Select
                value={similarityThreshold}
                onValueChange={setSimilarityThreshold}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.6">Low (60% similarity)</SelectItem>
                  <SelectItem value="0.7">Medium (70% similarity)</SelectItem>
                  <SelectItem value="0.8">High (80% similarity)</SelectItem>
                  <SelectItem value="0.9">
                    Very High (90% similarity)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>

          <div
            ref={graphRef}
            className="border rounded-md"
            style={{ height: "600px" }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full bg-muted/20">
                <p>Loading affinity data...</p>
              </div>
            ) : graphData.nodes.length > 0 ? (
              <ForceGraph2D
                graphData={graphData}
                nodeLabel={(node) => {
                  const typedNode = node as GraphNode;
                  const userRatingsCount = ratings.filter(
                    (r) => r.userId === typedNode.id
                  ).length;
                  return `${
                    typedNode.name || "Unknown"
                  } (${userRatingsCount} ratings)`;
                }}
                linkLabel={(link) =>
                  `Similarity: ${(link.value / 10).toFixed(2)}`
                }
                nodeRelSize={6}
                nodeAutoColorBy="group"
                linkWidth={(link) => Math.sqrt(link.value)}
                linkDirectionalArrowLength={0}
                cooldownTicks={100}
                onNodeHover={(node) => {
                  if (graphRef.current) {
                    graphRef.current.style.cursor = node
                      ? "pointer"
                      : "default";
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/20">
                <p>
                  No significant relationships found at the current threshold.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-muted/20 rounded-md flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                This visualization shows connections between library users based
                on similar rating patterns. Users who rate the same books with
                similar scores are connected, with thicker lines indicating
                stronger similarity.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>How to use:</strong> Hover over a node to see user
                details. Nodes represent users, and connections represent
                similar rating patterns. Adjust the similarity threshold to see
                stronger or weaker connections.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Data loaded:</strong> {users.length} users,{" "}
                {ratings.length} ratings, {graphData.links.length} connections
                found at {parseFloat(similarityThreshold) * 100}% similarity
                threshold.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

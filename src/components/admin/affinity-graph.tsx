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
import { User, Loan } from "@/lib/types";
import { userService } from "@/services/userService";
import { RefreshCw, Download, Info } from "lucide-react";
import api from "@/services/api";

// This would require a D3.js or similar library for visualization
// For simplicity, we'll create a placeholder component that would integrate with a visualization library

export function AffinityGraph() {
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [graphType, setGraphType] = useState("force"); // force, chord, heatmap
  const [threshold, setThreshold] = useState("2"); // Minimum number of shared books
  const graphRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && users.length > 0 && loans.length > 0) {
      renderGraph();
    }
  }, [loading, graphType, threshold]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersData = await userService.getAllUsers();
      const usersList = Array.isArray(usersData) ? usersData : [usersData];
      setUsers(usersList.filter((user) => user.role === "READER"));

      // In a real implementation, you'd need an API to fetch all loans
      // For demonstration purposes, let's assume we have a method to get all loans
      const loansData = await api.get("/api/loans");
      setLoans(loansData.data);
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

  const renderGraph = () => {
    if (!graphRef.current) return;

    // Clear previous graph
    graphRef.current.innerHTML = "";

    // In a real implementation, this is where you would use D3.js or a similar library
    // to render the actual graph visualization based on the data

    // For this example, we'll just display a placeholder message
    const placeholder = document.createElement("div");
    placeholder.className =
      "flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-md";
    placeholder.innerHTML = `
      <div class="text-center p-6">
        <p class="text-lg font-semibold mb-2">Reader Affinity Graph Visualization</p>
        <p class="text-sm text-muted-foreground mb-4">
          This would display a ${graphType} diagram showing connections between users who borrowed similar books.
          Current threshold: ${threshold} shared books.
        </p>
        <p class="text-xs text-muted-foreground">
          Data loaded: ${users.length} readers, ${loans.length} loan records.
        </p>
      </div>
    `;

    graphRef.current.appendChild(placeholder);
  };

  const handleDownloadGraph = () => {
    // In a real implementation, this would generate an SVG or PNG of the visualization
    toast({
      title: "Feature not implemented",
      description: "Graph download functionality would be implemented here.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reader Affinity Analysis</CardTitle>
          <CardDescription>
            Visualize relationships between readers based on similar book
            preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Visualization Type</label>
              <Select value={graphType} onValueChange={setGraphType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visualization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="force">Force-Directed Graph</SelectItem>
                  <SelectItem value="chord">Chord Diagram</SelectItem>
                  <SelectItem value="heatmap">Heatmap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">
                Similarity Threshold
              </label>
              <Select value={threshold} onValueChange={setThreshold}>
                <SelectTrigger>
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1+ Shared Books</SelectItem>
                  <SelectItem value="2">2+ Shared Books</SelectItem>
                  <SelectItem value="3">3+ Shared Books</SelectItem>
                  <SelectItem value="5">5+ Shared Books</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadGraph}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <p>Loading affinity data...</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <div ref={graphRef} className="h-[500px] w-full"></div>
            </div>
          )}

          <div className="mt-4 p-4 bg-muted/20 rounded-md flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                This visualization shows connections between library users based
                on their borrowing patterns. Users who borrow similar books are
                placed closer together, with the thickness of connections
                indicating the strength of their shared interests.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Use this graph to identify reader communities, recommend books
                to similar readers, or make collection development decisions
                based on user clusters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

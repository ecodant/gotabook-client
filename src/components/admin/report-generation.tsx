import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Users, BookOpen, BarChart } from "lucide-react";
import api from "@/services/api";

export function ReportGeneration() {
  const [reportType, setReportType] = useState("users");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateReport = async (type: string) => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing date range",
        description: "Please select both start and end dates for the report.",
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(type);

      // Format dates for API request
      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];

      // API call to generate report (this endpoint would need to be implemented on the backend)
      const response = await api.get(`/api/reports/${type}`, {
        params: { startDate: start, endDate: end },
        responseType: "blob", // Important for downloading files
      });

      // Create a download link for the report
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_report_${start}_to_${end}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Report generated",
        description: `The ${getReportName(type)} report has been downloaded.`,
      });
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      toast({
        title: "Report generation failed",
        description:
          "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getReportName = (type: string): string => {
    switch (type) {
      case "users":
        return "User Activity";
      case "books":
        return "Book Circulation";
      case "loans":
        return "Loan Statistics";
      case "ratings":
        return "Book Ratings";
      default:
        return "Report";
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "users":
        return <Users className="h-5 w-5" />;
      case "books":
        return <BookOpen className="h-5 w-5" />;
      case "loans":
        return <FileText className="h-5 w-5" />;
      case "ratings":
        return <BarChart className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getReportDescription = (type: string): string => {
    switch (type) {
      case "users":
        return "Information about user registrations, active users, and user engagement metrics.";
      case "books":
        return "Details about book inventory, popular books, and category distribution.";
      case "loans":
        return "Statistics on book loans, returns, overdue items, and borrowing patterns.";
      case "ratings":
        return "Analysis of book ratings, top-rated books, and reader preferences.";
      default:
        return "Generate a custom report with specified parameters.";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>
              Select the date range and type of report you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">User Activity Report</SelectItem>
                  <SelectItem value="books">Book Circulation Report</SelectItem>
                  <SelectItem value="loans">Loan Statistics Report</SelectItem>
                  <SelectItem value="ratings">Book Ratings Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <DatePicker
                  date={startDate}
                  onSelect={setStartDate}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <DatePicker
                  date={endDate}
                  onSelect={setEndDate}
                  placeholder="Select end date"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleGenerateReport(reportType)}
              disabled={loading !== null || !startDate || !endDate}
            >
              {loading === reportType ? (
                <>Generating...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Generate Report
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>
              Quick access to predefined reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {["users", "books", "loans", "ratings"].map((type) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    {getReportIcon(type)}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {getReportName(type)} Report
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getReportDescription(type)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading !== null || !startDate || !endDate}
                  onClick={() => handleGenerateReport(type)}
                >
                  {loading === type ? "..." : "Generate"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

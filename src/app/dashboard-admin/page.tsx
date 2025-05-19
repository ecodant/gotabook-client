import { useState } from "react";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookManagement } from "@/components/admin/book-management";
import { UserManagement } from "@/components/admin/user-management";
import { ReportGeneration } from "@/components/admin/report-generation";
import { AffinityGraph } from "@/components/admin/affinity-graph";

export function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState("books");

  const handleLogout = () => {
    // Clear user session/localStorage
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-2xl font-bold">
            Digital Library - Admin Dashboard
          </h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="books">Book Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="affinity">Affinity Graph</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            <h2 className="text-2xl font-bold">Book Management</h2>
            <BookManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold">User Management</h2>
            <UserManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <h2 className="text-2xl font-bold">Report Generation</h2>
            <ReportGeneration />
          </TabsContent>

          <TabsContent value="affinity" className="space-y-4">
            <h2 className="text-2xl font-bold">Reader Affinity Graph</h2>
            <AffinityGraph />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

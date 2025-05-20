import { useState } from "react";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookCatalog } from "@/components/dashboard/book-catalog";
import { UserLoans } from "@/components/dashboard/user-loans";
import { RatingSystem } from "@/components/dashboard/rating-system";
import { MessagingSystem } from "@/components/dashboard/messaging-system";
import UserWaitlists from "@/components/dashboard/user-waitlists";
import { UserFriends } from "@/components/dashboard/user-friends";

export function Dashboard() {
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
          <h1 className="text-2xl font-bold">Digital Library</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="books">Available Books</TabsTrigger>
            <TabsTrigger value="loans">My Loans</TabsTrigger>
            <TabsTrigger value="waitlists">My Waitlists</TabsTrigger>
            <TabsTrigger value="ratings">Rate Books</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            <h2 className="text-2xl font-bold">Book Catalog</h2>
            <BookCatalog />
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <h2 className="text-2xl font-bold">My Loans</h2>
            <UserLoans />
          </TabsContent>

          <TabsContent value="waitlists" className="space-y-4">
            <h2 className="text-2xl font-bold">My Waitlists</h2>
            <UserWaitlists />
          </TabsContent>

          <TabsContent value="ratings" className="space-y-4">
            <h2 className="text-2xl font-bold">Rate Books</h2>
            <RatingSystem />
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            <h2 className="text-2xl font-bold">Friends & Suggestions</h2>
            <UserFriends />
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <h2 className="text-2xl font-bold">Messages</h2>
            <MessagingSystem />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

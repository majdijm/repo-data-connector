import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import JobsPage from "./pages/JobsPage";
import ClientsPage from "./pages/ClientsPage";
import PaymentsPage from "./pages/PaymentsPage";
import PhotoSessionsPage from "./pages/PhotoSessionsPage";
import VideoTasksPage from "./pages/VideoTasksPage";
import DesignTasksPage from "./pages/DesignTasksPage";
import FilesPage from "./pages/FilesPage";
import NotificationsPage from "./pages/NotificationsPage";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/users" element={<Users />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/photo-sessions" element={<PhotoSessionsPage />} />
            <Route path="/video-tasks" element={<VideoTasksPage />} />
            <Route path="/design-tasks" element={<DesignTasksPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

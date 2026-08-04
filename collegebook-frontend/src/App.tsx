import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppLayout from "./components/AppLayout.tsx";
import FeedPage from "./pages/FeedPage.tsx";
import ExplorePage from "./pages/ExplorePage.tsx";
import CollabPage from "./pages/CollabPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import MyConPage from "./pages/MyConPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import StudentProfilePage from "./pages/StudentProfilePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route element={<AppLayout />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/collab" element={<CollabPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/mycon" element={<MyConPage />} />
            <Route path="/student/:name" element={<StudentProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

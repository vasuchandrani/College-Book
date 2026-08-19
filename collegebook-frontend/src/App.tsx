import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemedLoader from "@/components/ThemedLoader";

// Eagerly loaded (landing + auth — small, critical path)
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import AppLayout from "./components/AppLayout.tsx";

// Lazy loaded (large pages — loaded on demand)
const FeedPage = lazy(() => import("./pages/FeedPage.tsx"));
const ExplorePage = lazy(() => import("./pages/ExplorePage.tsx"));
const CollabPage = lazy(() => import("./pages/CollabPage.tsx"));
const CollabDetailPage = lazy(() => import("./pages/CollabDetailPage.tsx"));
const MyCollaborationPage = lazy(() => import("./pages/MyCollaborationPage.tsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.tsx"));
const MyConPage = lazy(() => import("./pages/MyConPage.tsx"));
const StudentProfilePage = lazy(() => import("./pages/StudentProfilePage.tsx"));
const PostPage = lazy(() => import("./pages/PostPage.tsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.tsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <ThemedLoader />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route element={<AppLayout />}>
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/post/:id" element={<PostPage />} />
              <Route path="/posts/:id" element={<PostPage />} />
              <Route path="/collab" element={<CollabPage />} />
              <Route path="/collab/:id" element={<CollabDetailPage />} />
              <Route path="/my-collaboration" element={<MyCollaborationPage />} />
              <Route path="/my-collab" element={<MyCollaborationPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/mycon" element={<MyConPage />} />
              <Route path="/student/:name" element={<StudentProfilePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

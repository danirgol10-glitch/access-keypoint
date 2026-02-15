import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import CityGateModal from "@/components/CityGateModal";
import MainLayout from "@/components/MainLayout";
import Auth from "./pages/Auth";
import ChooseUsername from "./pages/ChooseUsername";
import Home from "./pages/Home";
import Album from "./pages/Album";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import FriendDetail from "./pages/FriendDetail";
import FriendProfile from "./pages/FriendProfile";
import RequestDetail from "./pages/RequestDetail";
import Chats from "./pages/Chats";
import ChatDetail from "./pages/ChatDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CityGateModal />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <ChooseUsername />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/album" element={<Album />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/friend/:friendId" element={<FriendDetail />} />
              <Route path="/friend-profile/:friendId" element={<FriendProfile />} />
              <Route path="/request/:requestId" element={<RequestDetail />} />
              <Route path="/chat/:conversationId" element={<ChatDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

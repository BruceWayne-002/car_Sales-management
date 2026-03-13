import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auctions from "./pages/Auctions";
import AuctionDetail from "./pages/AuctionDetail";
import CreateAuction from "./pages/CreateAuction";
import PriceChecker from "./pages/PriceChecker";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const CarInsights = lazy(() => import("./pages/CarInsights"));
import PlateLookup from "./pages/PlateLookup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route path="/price-checker" element={<PriceChecker />} />
            <Route path="/create-auction" element={<ProtectedRoute><CreateAuction /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/plate-lookup" element={<PlateLookup />} />
            <Route
              path="/car-insights"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
                    <CarInsights />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

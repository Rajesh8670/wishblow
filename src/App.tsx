import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BirthdayProvider } from "@/contexts/BirthdayContext";
import LandingPage from "./pages/LandingPage";
import InputFormPage from "./pages/InputFormPage";
import CelebrationPage from "./pages/CelebrationPage";
import SharePage from "./pages/SharePage";
import WishRevealPage from "./pages/WishRevealPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BirthdayProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<InputFormPage />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="/celebrate" element={<CelebrationPage />} />
            <Route path="/wish" element={<WishRevealPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BirthdayProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

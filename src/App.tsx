import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Dashboard from "@/pages/Dashboard";
import EmailList from "@/pages/EmailList";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ApiHealthDebug() {
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        // eslint-disable-next-line no-console
        console.log("[api/health]", d);
      })
      .catch(() => {});
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ApiHealthDebug />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/emails" element={<EmailList />} />
              <Route path="/emails/:category" element={<EmailList />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

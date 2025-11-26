import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";

import Home from "@/pages/home";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import Scrims from "@/pages/scrims";
import Wallet from "@/pages/wallet";
import Profile from "@/pages/profile";
import Teammates from "@/pages/teammates";
import Leaderboard from "@/pages/leaderboard";
import Admin from "@/pages/admin";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Refund from "@/pages/refund";
import Disclaimer from "@/pages/disclaimer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/scrims" component={Scrims} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/profile" component={Profile} />
        <Route path="/teammates" component={Teammates} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/admin" component={Admin} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/refund" component={Refund} />
        <Route path="/disclaimer" component={Disclaimer} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

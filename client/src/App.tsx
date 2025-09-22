import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { NotificationSystem } from "@/components/notification-system";
import Dashboard from "./pages/dashboard";
import CreateAccount from "./pages/create-account";
import Deposit from "./pages/deposit";
import Withdraw from "./pages/withdraw";
import Transfer from "./pages/transfer";
import Accounts from "./pages/accounts";
import GitHubDeploy from "./pages/github-deploy";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/create-account" component={CreateAccount} />
            <Route path="/deposit" component={Deposit} />
            <Route path="/withdraw" component={Withdraw} />
            <Route path="/transfer" component={Transfer} />
            <Route path="/accounts" component={Accounts} />
            <Route path="/github-deploy" component={GitHubDeploy} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <NotificationSystem />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Header } from '@/components/layout/Header';
import Home from '@/pages/Home';
import Programs from '@/pages/Programs';
import Listings from '@/pages/Listings';
import Copilot from '@/pages/Copilot';
import { LanguageProvider } from '@/contexts/LanguageContext';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/programs" component={Programs} />
      <Route path="/listings" component={Listings} />
      <Route path="/copilot" component={Copilot} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <div className="min-h-[100dvh] flex flex-col">
              <Header />
              <main className="flex-1 flex flex-col">
                <Router />
              </main>
            </div>
          </WouterRouter>
        </LanguageProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

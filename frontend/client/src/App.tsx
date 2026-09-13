import { Route, Switch } from "wouter";
import { Landing } from "./pages/Landing";
import { GameShell } from "./pages/GameShell";
import "./index.css";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={GameShell} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;

import { Route, Switch } from "wouter";
import { Landing } from "./pages/Landing";
import { GameShell } from "./pages/GameShell";
import "./index.css";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

import { Redirect } from "wouter";
import { Show } from "@clerk/react";

function ProtectedGameShell() {
  return (
    <>
      <Show when="signed-in">
        <GameShell />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={ProtectedGameShell} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;

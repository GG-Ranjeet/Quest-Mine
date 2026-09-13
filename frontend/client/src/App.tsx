import { Route, Switch } from "wouter";
import { Landing } from "./pages/Landing";
import { GameShell } from "./pages/GameShell";
import "./index.css";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect } from "wouter";
import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { setTokenGetter } from "./services/api";

// Cache-first QueryClient: fetch once, serve from cache, sync in background.
// Never re-fetch on window focus, route change, or component remount if data is fresh.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,   // 10 min: treat data as fresh, no background re-fetch
      gcTime: 1000 * 60 * 30,       // 30 min: keep cache even when component is unmounted
      refetchOnWindowFocus: false,   // alt-tab/focus loss never triggers a re-fetch
      refetchOnReconnect: false,
      refetchOnMount: false,         // if data is in cache, use it immediately
      retry: 1,
    },
  },
});

// Sets up the Clerk token getter at the app level, so API calls always have auth.
// Putting this here (not inside GameShell) means the token is always available
// regardless of GameShell's mount/unmount lifecycle.
function ProtectedGameShell() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  // Wire up the token getter as soon as we know the user is signed in.
  // This is module-level in api.ts so it persists across renders.
  useEffect(() => {
    if (isSignedIn) {
      setTokenGetter(() => getToken());
    }
  }, [isSignedIn, getToken]);

  // Clerk still initializing — render nothing (fast, sub-100ms)
  if (!isLoaded) return null;
  // Confirmed signed out — go to landing
  if (!isSignedIn) return <Redirect to="/" />;
  // Signed in — mount GameShell once, keep it mounted for the session
  return <GameShell />;
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

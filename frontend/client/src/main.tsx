import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    appearance={{
      variables: {
        colorBackground: '#abb8c2ff'
      }
    }}
    publishableKey={PUBLISHABLE_KEY}
  >
    <App />
  </ClerkProvider>
);

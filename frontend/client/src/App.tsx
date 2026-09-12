import { Route, Switch } from "wouter";
import { Landing } from "./pages/Landing";
import { GameShell } from "./pages/GameShell";
import "./index.css";

function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route component={GameShell} />
    </Switch>
  );
}

export default App;

import type { PropsWithChildren } from "react";
import "./AppShell.css";

function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <div className="app-shell__content">{children}</div>
    </div>
  );
}

export default AppShell;

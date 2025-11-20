import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Schedule", path: "/schedule" },
  { label: "Appointments", path: "/admin/appointments" },
];

function SharedHeader() {
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand" aria-label="Hippocratic scheduling portal">
          <div className="brand-mark" aria-hidden>
            <span>H</span>
          </div>
          <div className="brand-text">
            <p className="brand-kicker">Hippocratic</p>
            <h1 className="brand-title">Scheduling Portal</h1>
          </div>
        </div>

        <nav className="app-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default SharedHeader;

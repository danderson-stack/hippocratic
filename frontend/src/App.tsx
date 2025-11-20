import { type ReactNode } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import SharedHeader from "./components/SharedHeader";
import AdminAppointmentDetailPage from "./pages/AdminAppointmentDetailPage.tsx";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import SchedulePage from "./pages/SchedulePage";
import "./App.css";

function HomePage() {
  return (
    <div className="page-card" style={{ display: "grid", gap: "12px" }}>
      <div className="page-header">
        <div>
          <p className="breadcrumbs">Breadcrumbs: Home</p>
          <h2 className="page-title">Available Routes</h2>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Quick links to the key scheduling and admin views.
          </p>
        </div>
      </div>

      <ul style={{ margin: 0, paddingLeft: "20px", display: "grid", gap: 8 }}>
        <li>
          <Link to="/schedule">Schedule Assistant</Link>
        </li>
        <li>
          <Link to="/admin/appointments">Admin Appointments</Link>
        </li>
        <li>
          <Link to="/admin/appointments/example">Appointment Detail (example)</Link>
        </li>
      </ul>
    </div>
  );
}

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <SharedHeader />
      <div className="app-content">{children}</div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
          <Route
            path="/admin/appointments/:id"
            element={<AdminAppointmentDetailPage />}
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import AdminAppointmentDetailPage from "./pages/AdminAppointmentDetailPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AppShell from "./pages/AppShell";
import SchedulePage from "./pages/SchedulePage";

function HomePage() {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div>
        <p style={{ margin: 0, color: "#475569" }}>Breadcrumbs: Home</p>
        <h1 style={{ margin: "4px 0 0" }}>Available Routes</h1>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: "10px",
        }}
      >
        <li>
          <Link to="/schedule">Appointment Schedule</Link>
        </li>
        <li>
          <Link to="/admin/appointments">Admin Appointments</Link>
        </li>
        <li>
          <Link to="/admin/appointments/example">Example Appointment Detail</Link>
        </li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppShell>
              <HomePage />
            </AppShell>
          }
        />
        <Route
          path="/schedule"
          element={
            <AppShell>
              <SchedulePage />
            </AppShell>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <AppShell>
              <AdminAppointmentsPage />
            </AppShell>
          }
        />
        <Route
          path="/admin/appointments/:id"
          element={
            <AppShell>
              <AdminAppointmentDetailPage />
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

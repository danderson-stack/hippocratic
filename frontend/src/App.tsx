import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import AdminAppointmentDetailPage from './pages/AdminAppointmentDetailPage.tsx'
import AdminAppointmentsPage from './pages/AdminAppointmentsPage'
import SchedulePage from './pages/SchedulePage'

function HomePage() {
  return (
    <div>
      <p>Breadcrumbs: Home</p>
      <h1>Available Routes</h1>
      <ul>
        <li>
          <Link to="/schedule">/schedule</Link>
        </li>
        <li>
          <Link to="/admin/appointments">/admin/appointments</Link>
        </li>
        <li>
          <Link to="/admin/appointments/example">/admin/appointments/:id</Link>
        </li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        <Route
          path="/admin/appointments/:id"
          element={<AdminAppointmentDetailPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

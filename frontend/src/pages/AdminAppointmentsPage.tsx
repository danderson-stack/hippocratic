import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type AppointmentListItem = {
  id: string;
  scheduledFor?: string;
  summary?: string;
  status?: string;
  createdAt?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
};

type AppointmentListResponse = {
  appointments: AppointmentListItem[];
  total: number;
  offset: number;
  limit: number;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const getPatientName = (user?: AppointmentListItem["user"]) => {
  if (!user) return "Unknown";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.id;
};

function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoadMore = appointments.length < total;

  const fetchAppointments = async (nextOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/appointments?offset=${nextOffset}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load appointments (${response.status})`);
      }

      const data: AppointmentListResponse = await response.json();
      setAppointments((current) => [...current, ...data.appointments]);
      setOffset(nextOffset + data.appointments.length);
      setTotal(data.total);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAppointments(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      style={{ margin: "0 auto", maxWidth: "960px", padding: "2rem 1.5rem" }}
    >
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: "0 0 0.5rem" }}>Breadcrumbs: Home / Admin</p>
          <h1 style={{ margin: 0 }}>Appointments</h1>
        </div>
      </header>

      {error && (
        <p style={{ color: "red" }}>
          There was a problem loading appointments: {error}
        </p>
      )}

      <section style={{ marginTop: "1.5rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Time</th>
              <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Patient</th>
              <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Summary</th>
              <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: "0.75rem 0" }}>
                  {formatDate(appointment.scheduledFor || appointment.createdAt)}
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  {getPatientName(appointment.user)}
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  {appointment.summary ?? appointment.status ?? "—"}
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  <Link to={`/admin/appointments/${appointment.id}`}>View</Link>
                </td>
              </tr>
            ))}
            {!appointments.length && !loading && (
              <tr>
                <td colSpan={4} style={{ padding: "1rem 0", textAlign: "center" }}>
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <button
            type="button"
            onClick={() => fetchAppointments(offset)}
            disabled={loading || (!appointments.length && offset > 0) || !canLoadMore}
            style={{ padding: "0.5rem 1rem", cursor: loading ? "wait" : "pointer" }}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
          <span style={{ color: "#6b7280" }}>
            Showing {appointments.length} of {total || appointments.length} appointments
          </span>
        </div>
      </section>
    </main>
  );
}

export default AdminAppointmentsPage;

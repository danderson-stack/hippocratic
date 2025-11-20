import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type AppointmentListItem = {
  id: string;
  scheduled_for?: string;
  scheduledAt?: string;
  reason?: string;
  summary?: string;
  patient?: string;
  patient_name?: string;
  user_name?: string;
  user?: {
    name?: string;
  };
  [key: string]: unknown;
};

const formatDate = (value?: string) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const getPatientName = (appointment: AppointmentListItem) =>
  appointment.user?.name ||
  appointment.patient ||
  appointment.patient_name ||
  appointment.user_name ||
  "Unknown";

const normalizeAppointments = (payload: unknown): AppointmentListItem[] => {
  if (Array.isArray(payload)) return payload as AppointmentListItem[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray(
      (payload as { appointments?: AppointmentListItem[] }).appointments
    )
  ) {
    return (payload as { appointments: AppointmentListItem[] }).appointments;
  }
  return [];
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3000/api/appointments", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load appointments (${response.status})`);
        }

        const data = await response.json();
        if (controller.signal.aborted) return;

        setAppointments(normalizeAppointments(data));
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        const message =
          fetchError instanceof Error ? fetchError.message : "Unknown error";
        setError(message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadAppointments();

    return () => controller.abort();
  }, []);

  const rows = useMemo(
    () =>
      appointments.map((appointment) => ({
        id: appointment.id,
        time: appointment.scheduled_for || appointment.scheduledAt,
        patient: getPatientName(appointment),
        summary: appointment.reason || appointment.summary || "Not provided",
      })),
    [appointments]
  );

  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth: "960px",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <header style={{ marginBottom: "1.5rem" }}>
        <p style={{ margin: 0 }}>Breadcrumbs: Home / Admin / Appointments</p>
        <h1 style={{ margin: "0.25rem 0 0" }}>Appointments</h1>
      </header>

      {loading && <p>Loading appointments...</p>}
      {error && (
        <p style={{ color: "red" }}>Unable to load appointments: {error}</p>
      )}

      {!loading && !error && (
        <div>
          {rows.length === 0 ? (
            <p>No appointments available.</p>
          ) : (
            <table
              style={{
                width: "100%",
                maxWidth: "860px",
                margin: "0 auto",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      padding: "0.5rem",
                    }}
                  >
                    Time
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      padding: "0.5rem",
                    }}
                  >
                    Patient
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      padding: "0.5rem",
                    }}
                  >
                    Summary
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      padding: "0.5rem",
                    }}
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((appointment) => (
                  <tr
                    key={appointment.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={{ padding: "0.5rem" }}>
                      {formatDate(appointment.time)}
                    </td>
                    <td style={{ padding: "0.5rem" }}>{appointment.patient}</td>
                    <td style={{ padding: "0.5rem" }}>{appointment.summary}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <Link
                        to={`/admin/appointments/${appointment.id}`}
                        style={{
                          display: "inline-block",
                          padding: "0.35rem 0.6rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          textDecoration: "none",
                        }}
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </main>
  );
}

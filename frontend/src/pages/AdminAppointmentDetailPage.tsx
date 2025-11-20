import { useMemo, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type AppointmentData = {
  id: string;
  status?: string;
  scheduledFor?: string;
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type UserData = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
};

type MessageData = {
  role: string;
  content: string;
  timestamp?: string;
  [key: string]: unknown;
};

type AppointmentResponse = {
  appointment?: AppointmentData;
  user?: UserData;
  messages?: MessageData[];
};

const formatDate = (value?: string) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const getPatientName = (user?: UserData | null) => {
  if (!user) return "Not provided";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || "Not provided";
};

function AdminAppointmentDetailPage() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    const loadAppointment = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/appointments/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load appointment (${response.status})`);
        }

        const data: AppointmentResponse = await response.json();
        if (controller.signal.aborted) return;

        setAppointment(data.appointment ?? null);
        setUser(data.user ?? null);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        const message =
          fetchError instanceof Error ? fetchError.message : "Unknown error";
        setError(message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadAppointment();

    return () => controller.abort();
  }, [id]);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (first, second) =>
          new Date(first.timestamp ?? "").getTime() -
          new Date(second.timestamp ?? "").getTime()
      ),
    [messages]
  );

  return (
    <main
      style={{ margin: "0 auto", maxWidth: "960px", padding: "2rem 1.5rem" }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/admin/appointments" style={{ textDecoration: "none" }}>
          ← Back to appointments
        </Link>
        <h1 style={{ margin: 0 }}>Appointment Details</h1>
      </header>

      {loading && <p>Loading appointment...</p>}
      {error && (
        <p style={{ color: "red" }}>
          There was a problem loading this appointment: {error}
        </p>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gap: "1.5rem", marginTop: "1.5rem" }}>
          <section
            style={{
              padding: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>User Information</h2>
            {user ? (
              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "max-content 1fr",
                  gap: "0.5rem 1rem",
                }}
              >
                <dt style={{ fontWeight: 600 }}>Name</dt>
                <dd>{getPatientName(user)}</dd>
                <dt style={{ fontWeight: 600 }}>Email</dt>
                <dd>{user.email ?? "Not provided"}</dd>
                <dt style={{ fontWeight: 600 }}>Phone</dt>
                <dd>{user.phone ?? "Not provided"}</dd>
                <dt style={{ fontWeight: 600 }}>User ID</dt>
                <dd>{user.id}</dd>
              </dl>
            ) : (
              <p>No user information available for this appointment.</p>
            )}
          </section>

          <section
            style={{
              padding: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Appointment Information</h2>
            {appointment ? (
              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "max-content 1fr",
                  gap: "0.5rem 1rem",
                }}
              >
                <dt style={{ fontWeight: 600 }}>Appointment ID</dt>
                <dd>{appointment.id}</dd>
                <dt style={{ fontWeight: 600 }}>Status</dt>
                <dd>{appointment.status ?? "Unknown"}</dd>
                <dt style={{ fontWeight: 600 }}>Scheduled For</dt>
                <dd>{formatDate(appointment.scheduledFor)}</dd>
                <dt style={{ fontWeight: 600 }}>Summary</dt>
                <dd>{appointment.summary ?? "Not specified"}</dd>
                <dt style={{ fontWeight: 600 }}>Created At</dt>
                <dd>{formatDate(appointment.createdAt)}</dd>
                <dt style={{ fontWeight: 600 }}>Updated At</dt>
                <dd>{formatDate(appointment.updatedAt)}</dd>
              </dl>
            ) : (
              <p>No appointment data found.</p>
            )}
          </section>

          <section
            style={{
              padding: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Message Transcript</h2>
            {sortedMessages.length ? (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: "0.75rem",
                }}
              >
                {sortedMessages.map((message, index) => (
                  <li
                    key={`${message.timestamp}-${index}`}
                    style={{
                      border: "1px solid #f3f4f6",
                      borderRadius: "6px",
                      padding: "0.75rem",
                    }}
                  >
                    <header
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {message.role || "Unknown sender"}
                      </span>
                      <span style={{ color: "#6b7280" }}>
                        {formatDate(message.timestamp)}
                      </span>
                    </header>
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No transcript messages available.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminAppointmentDetailPage;

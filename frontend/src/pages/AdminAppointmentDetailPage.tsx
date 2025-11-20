import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

type AppointmentData = {
  id: string;
  status?: string;
  scheduled_for?: string;
  reason?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

type UserData = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
};

type MessageData = {
  id: string | number;
  content: string;
  created_at: string;
  sender?: string;
  role?: string;
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

export default function AdminAppointmentDetailPage() {
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
        const response = await fetch(
          `http://localhost:3000/api/appointments/${id}`,
          {
            signal: controller.signal,
          }
        );

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
          new Date(first.created_at).getTime() -
          new Date(second.created_at).getTime()
      ),
    [messages]
  );

  return (
    <main className="page-card" style={{ display: "grid", gap: "14px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/admin/appointments" style={{ textDecoration: "none" }}>
          ← Back to appointments
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>
          Appointment Details
        </h1>
      </header>

      {loading && <p>Loading appointment...</p>}
      {error && (
        <p style={{ color: "red" }}>
          There was a problem loading this appointment: {error}
        </p>
      )}

      {!loading && !error && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <section
              style={{
                padding: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Appointment Info</h2>
              {appointment ? (
                <dl style={{ margin: 0 }}>
                  <div style={{ marginBottom: "0.35rem" }}>
                    <dt style={{ fontWeight: 600 }}>Appointment ID</dt>
                    <dd style={{ margin: 0 }}>{appointment.id}</dd>
                  </div>
                  <div style={{ marginBottom: "0.35rem" }}>
                    <dt style={{ fontWeight: 600 }}>Status</dt>
                    <dd style={{ margin: 0 }}>
                      {appointment.status ?? "Unknown"}
                    </dd>
                  </div>
                  <div style={{ marginBottom: "0.35rem" }}>
                    <dt style={{ fontWeight: 600 }}>Scheduled For</dt>
                    <dd style={{ margin: 0 }}>
                      {formatDate(appointment.scheduled_for)}
                    </dd>
                  </div>
                  <div style={{ marginBottom: "0.35rem" }}>
                    <dt style={{ fontWeight: 600 }}>Reason</dt>
                    <dd style={{ margin: 0 }}>
                      {appointment.reason ?? "Not specified"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p>No appointment data found.</p>
              )}
            </section>

            <section
              style={{
                padding: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Patient Info</h2>
              {user ? (
                <dl style={{ margin: 0 }}>
                  <div style={{ marginBottom: "0.35rem" }}>
                    <dt style={{ fontWeight: 600 }}>Name</dt>
                    <dd style={{ margin: 0 }}>{user.name ?? "Not provided"}</dd>
                  </div>
                  <div style={{ marginBottom: "0.35rem" }}>
                    <dt style={{ fontWeight: 600 }}>Email</dt>
                    <dd style={{ margin: 0 }}>
                      {user.email ?? "Not provided"}
                    </dd>
                  </div>
                  <div style={{ marginBottom: "0.35rem" }}>
                    <dt style={{ fontWeight: 600 }}>Phone</dt>
                    <dd style={{ margin: 0 }}>
                      {user.phone ?? "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 600 }}>User ID</dt>
                    <dd style={{ margin: 0 }}>{user.id}</dd>
                  </div>
                </dl>
              ) : (
                <p>No user information available for this appointment.</p>
              )}
            </section>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <section
              style={{
                padding: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Transaction Details</h2>
              {appointment ? (
                <dl style={{ margin: 0 }}>
                  <div style={{ marginBottom: "0.35rem" }}>
                    <dt style={{ fontWeight: 600 }}>Created</dt>
                    <dd style={{ margin: 0 }}>
                      {formatDate(appointment.created_at)}
                    </dd>
                  </div>
                  <div style={{ marginBottom: "0.35rem" }}>
                    <dt style={{ fontWeight: 600 }}>Updated</dt>
                    <dd style={{ margin: 0 }}>
                      {formatDate(appointment.updated_at)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p>No transaction details available.</p>
              )}
            </section>

            <section
              style={{
                padding: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Transcript / Messages</h2>
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
                  {sortedMessages.map((message) => (
                    <li
                      key={message.id}
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
                          {message.sender || message.role || "Unknown sender"}
                        </span>
                        <span style={{ color: "#6b7280" }}>
                          {formatDate(message.created_at)}
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
        </div>
      )}
    </main>
  );
}

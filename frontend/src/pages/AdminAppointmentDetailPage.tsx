import { useParams } from "react-router-dom";

function AdminAppointmentDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <p>Breadcrumbs: Home / Admin / Appointments / Detail</p>
      <h1>Appointment Detail</h1>
      <p>Viewing appointment: {id ?? "unknown"}</p>
      <p>Appointment detail and transcript placeholder.</p>
    </div>
  );
}

export default AdminAppointmentDetailPage;

import { Router } from "express";
import {
  getAppointmentDetail,
  getUserProfile,
  listAppointments,
} from "../services/storage";

const router = Router();

router.get("/", (req: any, res: any) => {
  const offset = Number.parseInt((req.query.offset as string) ?? "0", 10);
  const limit = Number.parseInt((req.query.limit as string) ?? "20", 10);

  const { appointments, total } = listAppointments({ offset, limit });

  const enriched = appointments.map((appointment) => ({
    ...appointment,
    user: getUserProfile(appointment.userId),
  }));

  return res.json({
    appointments: enriched,
    total,
    offset: Number.isFinite(offset) ? offset : 0,
    limit: Number.isFinite(limit) ? limit : 20,
  });
});

router.get("/:id", (req: any, res: any) => {
  const appointmentId = req.params.id;
  const detail = getAppointmentDetail(appointmentId);

  if (!detail) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  return res.json(detail);
});

export default router;

import { Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import PageHeader from '../components/PageHeader'

const demoAppointments = [
  { id: 'apt-001', patient: 'Jane Doe', date: '2025-12-01 10:00 AM', status: 'Confirmed' },
  { id: 'apt-002', patient: 'John Smith', date: '2025-12-01 11:00 AM', status: 'Pending' },
  { id: 'apt-003', patient: 'Alex Johnson', date: '2025-12-02 01:30 PM', status: 'Reschedule' },
]

function AdminAppointmentsPage() {
  return (
    <Stack spacing={2}>
      <PageHeader
        title="Appointments"
        subtitle="Review upcoming appointments and jump into detailed views."
      />
      <Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Date / Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {demoAppointments.map((appointment) => (
              <TableRow key={appointment.id} hover>
                <TableCell>{appointment.id}</TableCell>
                <TableCell>{appointment.patient}</TableCell>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>
                  <Chip label={appointment.status} size="small" color="primary" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  )
}

export default AdminAppointmentsPage

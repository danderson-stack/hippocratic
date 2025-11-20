import { Avatar, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import PageHeader from '../components/PageHeader'

function AdminAppointmentDetailPage() {
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Appointment Detail"
        subtitle="Review patient context, appointment metadata, and transcript snippets."
      />
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar alt="Patient avatar" src="" />
            <div>
              <Typography variant="h6">Patient Name</Typography>
              <Typography variant="body2" color="text.secondary">
                ID: apt-001 — Dec 1, 2025 at 10:00 AM
              </Typography>
            </div>
            <Chip label="Confirmed" color="success" sx={{ ml: 'auto' }} />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Transcript highlights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Placeholder transcript content. Drop in your call or chat transcript viewer here to let doctors
            review visit notes quickly.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default AdminAppointmentDetailPage

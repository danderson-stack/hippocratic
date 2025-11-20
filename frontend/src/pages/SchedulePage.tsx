import { Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import PageHeader from '../components/PageHeader'

function SchedulePage() {
  return (
    <Stack spacing={2}>
      <PageHeader
        title="Patient Schedule Chat"
        subtitle="Chat with our assistant to confirm or change your appointment schedule."
      />
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Chat transcript placeholder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This area will host the patient-facing chat UI for scheduling. Add your conversation
            components here.
          </Typography>
          <TextField fullWidth sx={{ mt: 3 }} placeholder="Type a message…" disabled />
        </CardContent>
      </Card>
    </Stack>
  )
}

export default SchedulePage

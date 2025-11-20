import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminAppointmentDetailPage from './pages/AdminAppointmentDetailPage'
import AdminAppointmentsPage from './pages/AdminAppointmentsPage'
import AppShell from './pages/AppShell'
import SchedulePage from './pages/SchedulePage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2f7ae5',
    },
    background: {
      default: '#f5f7fb',
    },
  },
  shape: {
    borderRadius: 12,
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/schedule" replace />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            <Route path="/admin/appointments/:id" element={<AdminAppointmentDetailPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, Box, Container, IconButton, Toolbar, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom'

const navLinkStyles = ({ isActive }: { isActive: boolean }) => ({
  color: '#fff',
  textDecoration: 'none',
  marginLeft: 16,
  fontWeight: isActive ? 700 : 500,
  borderBottom: isActive ? '2px solid #fff' : '2px solid transparent',
  paddingBottom: 4,
})

interface AppShellProps {
  children: React.ReactNode
}

function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: (theme) => theme.palette.background.default }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }} aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hippocratic Health Portal
          </Typography>
          <NavLink to="/schedule" style={navLinkStyles}>
            Schedule
          </NavLink>
          <NavLink to="/admin/appointments" style={navLinkStyles}>
            Appointments
          </NavLink>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  )
}

export default AppShell

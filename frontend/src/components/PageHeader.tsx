import { Stack, Typography } from '@mui/material'

interface PageHeaderProps {
  title: string
  subtitle?: string
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Stack spacing={1} mb={3}>
      <Typography variant="h4" component="h1" fontWeight={700} color="primary.dark">
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  )
}

export default PageHeader

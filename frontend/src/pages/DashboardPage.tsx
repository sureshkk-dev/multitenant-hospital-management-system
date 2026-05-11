import { Card, CardContent, Stack, Typography, Chip } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Welcome back{user?.email ? `, ${user.email}` : ''}.
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Current user
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {user?.email ?? '—'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip label={user?.role ?? 'unknown'} color="primary" />
              {user?.hospitalId ? (
                <Chip label={`hospitalId: ${user.hospitalId}`} />
              ) : null}
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Next steps
            </Typography>
            <Typography sx={{ mt: 1 }}>
              {user?.role === 'superAdmin' ? (
                <>
                  Use <b>Hospitals</b> to create tenants and hospital admin
                  accounts. Each tenant signs in on its own subdomain.
                </>
              ) : (
                <>
                  Manage <b>Patients</b> and <b>Doctors</b> from the sidebar.
                  Records are scoped to your hospital only.
                </>
              )}
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
}


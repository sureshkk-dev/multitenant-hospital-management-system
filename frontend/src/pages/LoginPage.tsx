import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { API_BASE_URL } from '../api';
import { parseTenantSubdomain } from '../tenant';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const tenantSubdomain = useMemo(
    () => parseTenantSubdomain(window.location.hostname),
    [],
  );

  const defaults = useMemo(
    () => ({
      email: tenantSubdomain ? '' : 'superadmin@local.test',
      password: tenantSubdomain ? '' : 'superadmin123',
    }),
    [tenantSubdomain],
  );

  const [email, setEmail] = useState(defaults.email);
  const [password, setPassword] = useState(defaults.password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(1200px 600px at 10% 10%, rgba(37,99,235,0.20) 0%, rgba(37,99,235,0) 60%), radial-gradient(1000px 500px at 90% 20%, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0) 60%), #0b1220',
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.14)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.85 }}>
                Hospital Multitenancy
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                Sign in
              </Typography>
              <Typography sx={{ opacity: 0.8, mt: 1 }}>
                {tenantSubdomain
                  ? `Tenant: ${tenantSubdomain} — use your hospital admin account for this site.`
                  : 'Use your super admin account on this central URL, or open your hospital subdomain to sign in as hospital admin.'}
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  fullWidth
                  slotProps={{
                    inputLabel: { sx: { color: 'rgba(255,255,255,0.75)' } },
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.22)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.18)',
                    },
                  }}
                />
                <TextField
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                  slotProps={{
                    inputLabel: { sx: { color: 'rgba(255,255,255,0.75)' } },
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.22)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.18)',
                    },
                  }}
                />

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Button
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    fontWeight: 800,
                    py: 1.25,
                    background:
                      'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                    color: '#0b1220',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #93c5fd 0%, #c4b5fd 100%)',
                    },
                  }}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

            <Stack spacing={0.5}>
              {tenantSubdomain ? (
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  Use the hospital admin email and password from when this
                  hospital was created.
                </Typography>
              ) : (
                <>
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    Default super admin
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      opacity: 0.95,
                    }}
                  >
                    {defaults.email} / {defaults.password}
                  </Typography>
                </>
              )}
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {tenantSubdomain
                  ? 'Super admin cannot sign in on tenant subdomains.'
                  : 'Tip: after login, manage hospitals from the sidebar (super admin only).'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Backend API:{' '}
                <Link href={API_BASE_URL} color="inherit">
                  {API_BASE_URL}
                </Link>
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

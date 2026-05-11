import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Drawer,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { apiFetch } from '../api';
import { useAuth } from '../auth/AuthProvider';
import {
  getTenantBaseDomain,
  hostsLineForSubdomain,
  tenantAppOrigin,
} from '../tenant';

type Hospital = {
  _id: string;
  name: string;
  slug: string;
  subdomain?: string;
  adminEmail?: string | null;
  createdAt?: string;
};

export default function HospitalsPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hostsHint, setHostsHint] = useState<{
    line: string;
    loginUrl: string;
  } | null>(null);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'name', headerName: 'Hospital name', flex: 1, minWidth: 200 },
      {
        field: 'adminEmail',
        headerName: 'Hospital admin email',
        flex: 1,
        minWidth: 220,
        valueFormatter: (value) => (value ? String(value) : '—'),
      },
      { field: 'subdomain', headerName: 'Subdomain', width: 140 },
      { field: 'slug', headerName: 'Slug', width: 200 },
      {
        field: 'createdAt',
        headerName: 'Created',
        width: 200,
        valueFormatter: (value) =>
          value ? new Date(String(value)).toLocaleString() : '',
      },
    ],
    [],
  );

  async function refresh() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Hospital[]>('/hospitals', { token });
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onCreate() {
    if (!token) return;
    setSaving(true);
    setSaveError(null);
    try {
      const subKey = subdomain.toLowerCase().trim();
      await apiFetch<Hospital>('/hospitals', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name,
          subdomain,
          adminEmail,
          adminPassword,
        }),
      });
      setHostsHint({
        line: hostsLineForSubdomain(subKey),
        loginUrl: `${tenantAppOrigin(subKey)}/login`,
      });
      setName('');
      setSubdomain('');
      setAdminEmail('');
      setAdminPassword('');
      setDrawerOpen(false);
      await refresh();
    } catch (e: any) {
      setSaveError(e?.message ?? 'Failed to create hospital');
    } finally {
      setSaving(false);
    }
  }

  const isSuperAdmin = user?.role === 'superAdmin';

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Hospitals
          </Typography>
          <Typography color="text.secondary">
            Create and manage tenant hospitals.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDrawerOpen(true)}
          disabled={!isSuperAdmin}
        >
          Add hospital
        </Button>
      </Box>

      {!isSuperAdmin ? (
        <Alert severity="warning">
          Your role is <b>{user?.role}</b>. Only super admins can manage
          hospitals.
        </Alert>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}

      {hostsHint ? (
        <Alert
          severity="success"
          onClose={() => setHostsHint(null)}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={() => void navigator.clipboard.writeText(hostsHint.line)}
            >
              Copy hosts line
            </Button>
          }
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Your browser cannot change <code>/etc/hosts</code> (that file is
            owned by the OS and needs root). Copy the line below, then run{' '}
            <code>sudo nano /etc/hosts</code> (or your editor) and paste it.
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Add this line to /etc/hosts
          </Typography>
          <Typography
            variant="body2"
            component="pre"
            sx={{ mt: 1, mb: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
          >
            {hostsHint.line}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Then open the hospital admin login: <b>{hostsHint.loginUrl}</b>{' '}
            (base domain <b>{getTenantBaseDomain()}</b>).
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Optional: use local DNS (e.g. dnsmasq) with a wildcard like{' '}
            <code>*.hospital.com → 127.0.0.1</code> so you do not add a line per
            hospital.
          </Typography>
        </Alert>
      ) : null}

      <Card>
        <CardHeader
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 800 } }}
          title="All hospitals"
          subheader="List of registered tenant hospitals."
        />
        <CardContent sx={{ height: 520, pt: 0 }}>
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={rows.map((r) => ({ ...r, id: r._id }))}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              sx={{
                border: 0,
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(15, 23, 42, 0.02)',
                },
              }}
              localeText={{
                noRowsLabel: 'No hospitals yet. Click “Add hospital” to create one.',
              }}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
              }}
            />
          )}
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 440, p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Add hospital
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            This creates a new tenant hospital.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <TextField
              label="Hospital name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoFocus
              helperText="Example: City Hospital"
            />
            <TextField
              label="Subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              fullWidth
              helperText={`Example: city → city.${getTenantBaseDomain()} (add the suggested line to /etc/hosts for local dev).`}
            />

            <Divider />

            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Hospital admin login
            </Typography>
            <TextField
              label="Admin email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              type="email"
              fullWidth
              helperText="This user will be created as hospitalAdmin."
            />
            <TextField
              label="Admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              type="password"
              fullWidth
              helperText="Min 8 characters."
            />

            {saveError ? <Alert severity="error">{saveError}</Alert> : null}

            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button onClick={() => setDrawerOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onCreate}
                disabled={
                  saving ||
                  name.trim().length < 2 ||
                  subdomain.trim().length < 1 ||
                  adminEmail.trim().length < 3 ||
                  adminPassword.trim().length < 8
                }
              >
                {saving ? 'Saving…' : 'Create'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}


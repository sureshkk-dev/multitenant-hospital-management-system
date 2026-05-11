import { useCallback, useEffect, useMemo, useState } from 'react';
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
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { apiFetch } from '../api';
import { useAuth } from '../auth/AuthProvider';

export type StaffKind = 'patient' | 'doctor';

type RowBase = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  dateOfBirth?: string;
  specialty?: string;
};

const titles: Record<StaffKind, { title: string; subtitle: string; singular: string }> = {
  patient: {
    title: 'Patients',
    subtitle: 'Create, edit, and activate or deactivate patients for your hospital.',
    singular: 'patient',
  },
  doctor: {
    title: 'Doctors',
    subtitle: 'Create, edit, and activate or deactivate doctors for your hospital.',
    singular: 'doctor',
  },
};

export default function StaffDirectoryPage({ kind }: { kind: StaffKind }) {
  const { token } = useAuth();
  const apiPath = kind === 'patient' ? '/patients' : '/doctors';
  const meta = titles[kind];

  const [rows, setRows] = useState<RowBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<RowBase[]>(apiPath, { token });
      setRows(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [apiPath, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const patchActive = useCallback(
    async (id: string, next: boolean) => {
      if (!token) return;
      try {
        await apiFetch(`${apiPath}/${id}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ active: next }),
        });
        await refresh();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Update failed';
        setError(msg);
      }
    },
    [apiPath, refresh, token],
  );

  const openCreate = () => {
    setEditingId(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDateOfBirth('');
    setSpecialty('');
    setActive(true);
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openEdit = useCallback((row: RowBase) => {
    setEditingId(row._id);
    setFirstName(row.firstName);
    setLastName(row.lastName);
    setEmail(row.email ?? '');
    setPhone(row.phone ?? '');
    setDateOfBirth(row.dateOfBirth ?? '');
    setSpecialty(row.specialty ?? '');
    setActive(row.active);
    setSaveError(null);
    setDrawerOpen(true);
  }, []);

  const columns = useMemo<GridColDef[]>(() => {
    const base: GridColDef[] = [
      {
        field: 'fullName',
        headerName: 'Name',
        flex: 1,
        minWidth: 180,
        valueGetter: (_v, row) => `${row.firstName} ${row.lastName}`.trim(),
      },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
      { field: 'phone', headerName: 'Phone', width: 140 },
    ];

    if (kind === 'patient') {
      base.push({
        field: 'dateOfBirth',
        headerName: 'Date of birth',
        width: 130,
        valueFormatter: (v) => (v ? String(v) : '—'),
      });
    } else {
      base.push({
        field: 'specialty',
        headerName: 'Specialty',
        flex: 1,
        minWidth: 140,
        valueFormatter: (v) => (v ? String(v) : '—'),
      });
    }

    base.push({
      field: 'active',
      headerName: 'Active',
      width: 110,
      renderCell: (params: GridRenderCellParams<RowBase>) => (
        <Switch
          size="small"
          checked={Boolean(params.row.active)}
          onChange={(e) => void patchActive(params.row._id, e.target.checked)}
        />
      ),
    });

    base.push({
      field: 'actions',
      headerName: '',
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<RowBase>) => (
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => openEdit(params.row)}
        >
          Edit
        </Button>
      ),
    });

    return base;
  }, [kind, patchActive, openEdit]);

  async function onSave() {
    if (!token) return;
    setSaving(true);
    setSaveError(null);
    try {
      const body: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        active,
      };
      if (kind === 'patient') {
        body.dateOfBirth = dateOfBirth.trim() || undefined;
      } else {
        body.specialty = specialty.trim() || undefined;
      }

      if (editingId) {
        await apiFetch(`${apiPath}/${editingId}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch(apiPath, {
          method: 'POST',
          token,
          body: JSON.stringify(body),
        });
      }
      setDrawerOpen(false);
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    firstName.trim().length >= 1 && lastName.trim().length >= 1 && !saving;

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {meta.title}
          </Typography>
          <Typography color="text.secondary">{meta.subtitle}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add {meta.singular}
        </Button>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardHeader
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 800 } }}
          title={`All ${meta.title.toLowerCase()}`}
        />
        <CardContent sx={{ height: 560, pt: 0 }}>
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
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
              }}
            />
          )}
        </CardContent>
      </Card>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {editingId ? `Edit ${meta.singular}` : `Add ${meta.singular}`}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <TextField
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              fullWidth
            />
            <TextField
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
            />
            {kind === 'patient' ? (
              <TextField
                label="Date of birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            ) : (
              <TextField
                label="Specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                fullWidth
              />
            )}
            <FormControlLabel
              control={
                <Switch checked={active} onChange={(e) => setActive(e.target.checked)} />
              }
              label="Active"
            />
            {saveError ? <Alert severity="error">{saveError}</Alert> : null}
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setDrawerOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="contained" onClick={() => void onSave()} disabled={!canSave}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}

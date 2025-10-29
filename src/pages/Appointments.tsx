import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Table from '@mui/joy/Table';
import Input from '@mui/joy/Input';
import Chip from '@mui/joy/Chip';
import Stack from '@mui/joy/Stack';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import Visibility from '@mui/icons-material/Visibility';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import Search from '@mui/icons-material/Search';
import ViewColumn from '@mui/icons-material/ViewColumn';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Checkbox from '@mui/joy/Checkbox';
import Clear from '@mui/icons-material/Clear';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

interface VitalSigns {
  bloodPressure: string;
  respirationRate: number;
  heartRate: number;
  borgScale: number;
}

interface AppointmentTreatment {
  id: number;
  name: string;
  price: number;
}

interface Appointment {
  id: number;
  patientName: string;
  patientId: number;
  date: string;
  vitalSigns: VitalSigns;
  treatments: AppointmentTreatment[];
  totalPrice: number;
  created_at: string;
}

const Appointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 items per page
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [columnVisibility, setColumnVisibility] = useState({
    patient: true,
    date: true,
    vitalSigns: false,
    treatments: false,
    totalPrice: true,
    actions: true
  });
  const [sortField, setSortField] = useState<keyof Appointment | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const storedAppointments = localStorage.getItem('appointments');
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      } else {
        // Add some default appointments
        const defaultAppointments: Appointment[] = [
          {
            id: 1,
            patientName: 'John Doe',
            patientId: 1,
            date: new Date().toISOString().split('T')[0],
            vitalSigns: {
              bloodPressure: '120/80',
              respirationRate: 16,
              heartRate: 72,
              borgScale: 3
            },
            treatments: [
              { id: 1, name: 'General Consultation', price: 150000 },
              { id: 2, name: 'Blood Test', price: 250000 }
            ],
            totalPrice: 400000,
            created_at: new Date().toISOString()
          }
        ];
        localStorage.setItem('appointments', JSON.stringify(defaultAppointments));
        setAppointments(defaultAppointments);
      }
    } catch (error) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    if (window.confirm(`Are you sure you want to delete appointment for "${appointment.patientName}"?`)) {
      try {
        const updatedAppointments = appointments.filter(a => a.id !== appointment.id);
        localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        setAppointments(updatedAppointments);
      } catch (error) {
        setError('Failed to delete appointment');
      }
    }
  };

  const handleColumnVisibilityChange = (column: keyof typeof columnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleSort = (field: keyof Appointment) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to descending by default for dates, ascending for others
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(appointment => {
      const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Apply date range filter if dates are set
      if (dateRange.start || dateRange.end) {
        const appointmentDate = new Date(appointment.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        // Set times to start/end of day for inclusive comparison
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        if (startDate && appointmentDate < startDate) return false;
        if (endDate && appointmentDate > endDate) return false;
      }

      return true;
    });

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';

        // Special handling for dates
        if (sortField === 'date' || sortField === 'created_at') {
          aValue = aValue ? new Date(aValue as string).getTime() : 0;
          bValue = bValue ? new Date(bValue as string).getTime() : 0;
        }

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [appointments, searchTerm, dateRange, sortField, sortDirection]);

  // Reset to page 1 when search term or date range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange]);

  const clearDateRange = () => {
    setDateRange({ start: '', end: '' });
  };

  // Calculate pagination
  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  
  const getBorgScaleColor = (scale: number) => {
    if (scale <= 3) return 'success';
    if (scale <= 6) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography level="body-lg" sx={{ color: '#ffffff' }}>Loading appointments...</Typography>
        </Stack>
      </Box>
    );
  }
  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      p: 2,
      boxSizing: 'border-box',
      minWidth: 0
    }}>
      <Box sx={{ mb: 3 }}>
        <Typography level="h2">Appointments</Typography>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="danger">{error}</Typography>
        </Box>
      )}

      {/* Search and Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, minWidth: 300 }}>
          <Input
            startDecorator={<Search sx={{ color: '#ffffff' }} />}
            placeholder="Search appointments by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              maxWidth: 400,
              flex: 1,
              color: '#ffffff',
              '&::placeholder': {
                color: '#ffffff !important',
                opacity: 0.7
              },
              '& input': {
                color: '#ffffff !important'
              }
            }}
          />
          <Dropdown>
            <MenuButton
              variant="outlined"
              startDecorator={<ViewColumn sx={{ color: '#ffffff' }} />}
              sx={{ borderRadius: 'sm', color: '#ffffff' }}
            >
              Columns
            </MenuButton>
            <Menu placement="bottom-end">
              <MenuItem onClick={() => handleColumnVisibilityChange('patient')}>
                <Checkbox
                  checked={columnVisibility.patient}
                  sx={{ mr: 1 }}
                />
                <Typography sx={{ color: '#ffffff' }}>Patient Name</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleColumnVisibilityChange('date')}>
                <Checkbox
                  checked={columnVisibility.date}
                  sx={{ mr: 1 }}
                />
                <Typography sx={{ color: '#ffffff' }}>Date</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleColumnVisibilityChange('vitalSigns')}>
                <Checkbox
                  checked={columnVisibility.vitalSigns}
                  sx={{ mr: 1 }}
                />
                <Typography sx={{ color: '#ffffff' }}>Vital Signs</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleColumnVisibilityChange('treatments')}>
                <Checkbox
                  checked={columnVisibility.treatments}
                  sx={{ mr: 1 }}
                />
                <Typography sx={{ color: '#ffffff' }}>Treatments</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleColumnVisibilityChange('totalPrice')}>
                <Checkbox
                  checked={columnVisibility.totalPrice}
                  sx={{ mr: 1 }}
                />
                <Typography sx={{ color: '#ffffff' }}>Total Price</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleColumnVisibilityChange('actions')}>
                <Checkbox
                  checked={columnVisibility.actions}
                  sx={{ mr: 1 }}
                />
                <Typography sx={{ color: '#ffffff' }}>Actions</Typography>
              </MenuItem>
            </Menu>
          </Dropdown>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Date Range Filter */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 320 }}>
            <Typography level="body-sm" sx={{ color: '#ffffff', whiteSpace: 'nowrap' }}>Date Range:</Typography>
            <Input
              type="date"
              placeholder="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              sx={{
                width: 150,
                color: '#ffffff',
                '& input': {
                  color: '#ffffff !important'
                },
                '&::placeholder': {
                  color: '#ffffff !important',
                  opacity: 0.7
                }
              }}
            />
            <Typography level="body-sm" sx={{ color: '#ffffff' }}>to</Typography>
            <Input
              type="date"
              placeholder="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              sx={{
                width: 150,
                color: '#ffffff',
                '& input': {
                  color: '#ffffff !important'
                },
                '&::placeholder': {
                  color: '#ffffff !important',
                  opacity: 0.7
                }
              }}
            />
            {(dateRange.start || dateRange.end) && (
              <IconButton
                size="sm"
                variant="outlined"
                color="neutral"
                onClick={clearDateRange}
                sx={{ color: '#ffffff' }}
                title="Clear date filter"
              >
                <Clear />
              </IconButton>
            )}
          </Box>

          <Button
            variant="solid"
            color="primary"
            startDecorator={<Add />}
            onClick={() => navigate('/appointments/new')}
          >
            New Appointment
          </Button>
        </Box>
      </Box>

      {/* Pagination Info */}
      {totalItems > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm" sx={{ color: '#ffffff' }}>
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} appointments
            {(searchTerm || dateRange.start || dateRange.end) && ` (filtered from ${appointments.length} total)`}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#ffffff' }}>
            Page {currentPage} of {totalPages}
          </Typography>
        </Box>
      )}

      {/* Appointments Table */}
      <Card>
        {currentAppointments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography level="h4" sx={{ mb: 2, color: '#ffffff' }}>
              {searchTerm ? 'No appointments found' : 'No appointments available'}
            </Typography>
            <Typography level="body-sm" sx={{ mb: 3, color: '#ffffff' }}>
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first appointment'
              }
            </Typography>
            {!searchTerm && (
              <Button
                variant="solid"
                color="primary"
                startDecorator={<Add />}
                onClick={() => navigate('/appointments/new')}
              >
                Create First Appointment
              </Button>
            )}
          </Box>
        ) : (
          <Sheet sx={{ overflow: 'auto', borderRadius: 'sm' }}>
            <Table
              aria-labelledby="tableTitle"
              hoverRow
              sx={{
                '& tbody tr:hover': {
                  backgroundColor: 'background.level2',
                },
                '& thead th': {
                  backgroundColor: 'background.level1',
                  fontWeight: 'bold',
                  color: 'text.primary',
                },
              }}
            >
            <thead>
              <tr>
                {columnVisibility.date && (
                  <th
                    style={{ width: 200, padding: '12px', color: '#ffffff', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort('date')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <ArrowUpward sx={{ fontSize: 14, color: '#ffffff' }} /> : <ArrowDownward sx={{ fontSize: 14, color: '#ffffff' }} />
                      )}
                      Date
                    </Box>
                  </th>
                )}
                {columnVisibility.patient && <th style={{ minWidth: 200, padding: '12px', color: '#ffffff' }}>Patient</th>}
                {columnVisibility.vitalSigns && <th style={{ minWidth: 250, padding: '12px', color: '#ffffff' }}>Vital Signs</th>}
                {columnVisibility.treatments && <th style={{ width: 150, padding: '12px', color: '#ffffff' }}>Treatments</th>}
                {columnVisibility.totalPrice && <th style={{ width: 150, padding: '12px', color: '#ffffff' }}>Total Price</th>}
                {columnVisibility.actions && <th style={{ width: 200, padding: '12px', color: '#ffffff' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  {columnVisibility.date && (
                    <td style={{ padding: '12px' }}>
                      <Typography
                        component="a"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/appointments/${appointment.id}`);
                        }}
                        sx={{
                          color: '#ffffff',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          '&:hover': {
                            color: '#ffffff',
                            textDecoration: 'none',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            textShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
                          }
                        }}
                      >
                        {formatAppointmentDate(appointment.date)}
                      </Typography>
                    </td>
                  )}
                  {columnVisibility.patient && (
                    <td style={{ padding: '12px', fontWeight: 500, color: '#ffffff' }}>
                      <Typography
                        level="body-sm"
                        fontWeight="bold"
                        component="a"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/patients/${appointment.patientId}`);
                        }}
                        sx={{
                          color: '#ffffff',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          '&:hover': {
                            color: '#ffffff',
                            textDecoration: 'none',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            textShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
                          }
                        }}
                      >
                        {appointment.patientName}
                      </Typography>
                    </td>
                  )}
                  {columnVisibility.vitalSigns && (
                    <td style={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography level="body-xs" sx={{ color: '#ffffff' }}>
                          BP: {appointment.vitalSigns.bloodPressure}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: '#ffffff' }}>
                          RR: {appointment.vitalSigns.respirationRate} | HR: {appointment.vitalSigns.heartRate}
                        </Typography>
                        <Chip
                          size="sm"
                          color={getBorgScaleColor(appointment.vitalSigns.borgScale)}
                          variant="soft"
                        >
                          Borg: {appointment.vitalSigns.borgScale}/10
                        </Chip>
                      </Box>
                    </td>
                  )}
                  {columnVisibility.treatments && (
                    <td style={{ padding: '12px' }}>
                      <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                        {appointment.treatments.length} treatment{appointment.treatments.length !== 1 ? 's' : ''}
                      </Typography>
                    </td>
                  )}
                  {columnVisibility.totalPrice && (
                    <td style={{ padding: '12px' }}>
                      <Chip color="success" variant="soft">
                        {formatCurrency(appointment.totalPrice)}
                      </Chip>
                    </td>
                  )}
                  {columnVisibility.actions && (
                    <td style={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="sm"
                          variant="outlined"
                          color="primary"
                          onClick={() => navigate(`/appointments/${appointment.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="outlined"
                          color="danger"
                          onClick={() => handleDeleteAppointment(appointment)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
        )}
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            sx={{ color: '#ffffff', borderColor: '#ffffff' }}
          >
            First
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            sx={{ color: '#ffffff', borderColor: '#ffffff' }}
          >
            Previous
          </Button>

          <Typography sx={{
            display: 'flex',
            alignItems: 'center',
            color: '#ffffff',
            mx: 2
          }}>
            Page {currentPage} of {totalPages}
          </Typography>

          <Button
            variant="outlined"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            sx={{ color: '#ffffff', borderColor: '#ffffff' }}
          >
            Next
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            sx={{ color: '#ffffff', borderColor: '#ffffff' }}
          >
            Last
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Appointments;
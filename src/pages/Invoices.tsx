import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Table from '@mui/joy/Table';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Chip from '@mui/joy/Chip';
import Stack from '@mui/joy/Stack';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import Visibility from '@mui/icons-material/Visibility';
import Search from '@mui/icons-material/Search';
import Receipt from '@mui/icons-material/Receipt';
import Delete from '@mui/icons-material/Delete';
import Clear from '@mui/icons-material/Clear';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import { Invoice } from '../types';
import logService from '../services/logService';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 items per page
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [quickDateRange, setQuickDateRange] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Invoice | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    try {
      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      } else {
        setInvoices([]);
      }
    } catch (error) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const filteredInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Apply date range filter if dates are set
      if (dateRange.start || dateRange.end) {
        const invoiceDate = new Date(invoice.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        // Set times to start/end of day for inclusive comparison
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        if (startDate && invoiceDate < startDate) return false;
        if (endDate && invoiceDate > endDate) return false;
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
  }, [invoices, searchTerm, dateRange, sortField, sortDirection]);

  // Reset to page 1 when search term or date range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange, quickDateRange, sortField, sortDirection]);

  const clearDateRange = () => {
    setDateRange({ start: '', end: '' });
    setQuickDateRange('');
  };

  const handleQuickDateRangeChange = (value: string | null) => {
    setQuickDateRange(value || '');
    if (value) {
      const today = new Date();
      let startDate = new Date();
      let endDate = new Date();

      switch (value) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'this_month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        case 'last_30_days':
          startDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'this_year':
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        default:
          setDateRange({ start: '', end: '' });
          return;
      }

      setDateRange({
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      });
    } else {
      setDateRange({ start: '', end: '' });
    }
  };

  const handleSort = (field: keyof Invoice) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to descending by default for dates, ascending for others
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc');
    }
  };

  // Calculate pagination
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'unpaid': return 'warning';
      case 'void': return 'danger';
      default: return 'neutral';
    }
  };

  const handleDeleteInvoice = (invoiceId: number) => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        const storedInvoices = localStorage.getItem('invoices');
        if (storedInvoices) {
          const invoices: Invoice[] = JSON.parse(storedInvoices);
          const invoiceToDelete = invoices.find(inv => inv.id === invoiceId);

          // Log invoice deletion before removing
          if (invoiceToDelete) {
            logService.logInvoiceDeleted(invoiceId, invoiceToDelete.patientId, invoiceToDelete.patientName, invoiceToDelete.operatorName);
          }

          const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
          localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
          setInvoices(updatedInvoices);

          // Reset to page 1 if current page would be empty
          const newTotalItems = updatedInvoices.length;
          const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          }
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography level="body-lg" sx={{ color: '#ffffff' }}>Loading invoices...</Typography>
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
        <Typography level="h2" sx={{ color: '#ffffff' }}>Invoices</Typography>
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
            placeholder="Search invoices by number or patient name..."
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
          <Select
            value={quickDateRange}
            onChange={(_, value) => handleQuickDateRangeChange(value)}
            placeholder="Show by..."
            sx={{
              minWidth: 150,
              color: '#ffffff',
              '& .MuiSelect-select': {
                color: '#ffffff !important'
              }
            }}
          >
            <Option value="today" sx={{ color: '#ffffff' }}>Today</Option>
            <Option value="this_month" sx={{ color: '#ffffff' }}>This Month</Option>
            <Option value="last_30_days" sx={{ color: '#ffffff' }}>Last 30 Days</Option>
            <Option value="this_year" sx={{ color: '#ffffff' }}>This Year</Option>
          </Select>
        </Box>

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
      </Box>

      {/* Pagination Info */}
      {totalItems > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm" sx={{ color: '#ffffff' }}>
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} invoices
            {(searchTerm || dateRange.start || dateRange.end) && ` (filtered from ${invoices.length} total)`}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#ffffff' }}>
            Page {currentPage} of {totalPages}
          </Typography>
        </Box>
      )}

      {/* Invoices Table */}
      <Card>
        {currentInvoices.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography level="h4" sx={{ mb: 2, color: '#ffffff' }}>
              {searchTerm ? 'No invoices found' : 'No invoices available'}
            </Typography>
            <Typography level="body-sm" sx={{ mb: 3, color: '#ffffff' }}>
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Generate invoices from appointment details to see them here'
              }
            </Typography>
            {!searchTerm && (
              <Button
                variant="solid"
                color="primary"
                startDecorator={<Receipt />}
                onClick={() => navigate('/appointments')}
              >
                View Appointments
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
                <th style={{ width: 150, padding: '12px', color: '#ffffff' }}>Invoice #</th>
                <th style={{ minWidth: 200, padding: '12px', color: '#ffffff' }}>Patient</th>
                <th
                  style={{ width: 150, padding: '12px', color: '#ffffff', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('date')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <ArrowUpward sx={{ fontSize: 14, color: '#ffffff' }} /> : <ArrowDownward sx={{ fontSize: 14, color: '#ffffff' }} />
                    )}
                    Date & Time
                  </Box>
                </th>
                <th style={{ width: 150, padding: '12px', color: '#ffffff' }}>Operator</th>
                <th style={{ width: 150, padding: '12px', color: '#ffffff' }}>Total Amount</th>
                <th style={{ width: 120, padding: '12px', color: '#ffffff' }}>Status</th>
                <th style={{ width: 120, padding: '12px', color: '#ffffff' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td style={{ padding: '12px' }}>
                    <Typography
                      component="a"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/invoices/${invoice.id}`);
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
                      {invoice.invoiceNumber}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 500, color: '#ffffff' }}>
                    <Typography
                      level="body-sm"
                      fontWeight="bold"
                      component="a"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/patients/${invoice.patientId}`);
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
                      {invoice.patientName}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', color: '#ffffff' }}>
                    <Typography
                      level="body-sm"
                      component="a"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/appointments/${invoice.appointmentId}`);
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
                      {formatDate(invoice.date)}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px', color: '#ffffff' }}>
                    <Typography level="body-sm">
                      {invoice.operatorName}
                    </Typography>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Chip color="success" variant="soft">
                      {formatCurrency(invoice.totalAmount)}
                    </Chip>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Chip
                      color={getStatusColor(invoice.status)}
                      variant="soft"
                      size="sm"
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Chip>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="sm"
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="outlined"
                        color="danger"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </td>
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

export default Invoices;
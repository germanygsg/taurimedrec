import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import CircularProgress from '@mui/joy/CircularProgress';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Print from '@mui/icons-material/Print';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Divider from '@mui/joy/Divider';
import { Invoice } from '../types';
import { Patient } from '../types';

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvoice(parseInt(id));
    }
  }, [id]);

  const loadInvoice = async (invoiceId: number) => {
    try {
      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) {
        const invoices: Invoice[] = JSON.parse(storedInvoices);
        const foundInvoice = invoices.find(inv => inv.id === invoiceId);

        if (foundInvoice) {
          setInvoice(foundInvoice);
          // Load the patient data
          await loadPatient(foundInvoice.patientId);
        } else {
          setError('Invoice not found');
        }
      } else {
        setError('No invoices found');
      }
    } catch (error) {
      setError('Failed to load invoice');
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatient = async (patientId: number) => {
    try {
      const storedPatients = localStorage.getItem('patient_management_data');
      if (storedPatients) {
        const patients: Patient[] = JSON.parse(storedPatients);
        const foundPatient = patients.find(p => p.id === patientId);
        setPatient(foundPatient || null);
      }
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const updateInvoiceStatus = (newStatus: 'paid' | 'unpaid' | 'void') => {
    if (!invoice) return;

    setIsUpdating(true);
    try {
      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) {
        const invoices: Invoice[] = JSON.parse(storedInvoices);
        const updatedInvoices = invoices.map(inv =>
          inv.id === invoice.id
            ? { ...inv, status: newStatus, updated_at: new Date().toISOString() }
            : inv
        );
        localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
        setInvoice({ ...invoice, status: newStatus, updated_at: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    } finally {
      setIsUpdating(false);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateForPrint = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  };

  const handlePrint = () => {
    if (!invoice || !patient) return;

    // Store original body content
    const originalContent = document.body.innerHTML;

    const printContent = `<div style="font-family: monospace; font-size: 12px; line-height: 1.2; color: black; background: white; position: absolute; top: 0; left: 0; margin: 0; padding: 0; white-space: pre; letter-spacing: 3px;">
BSP CENTER PHYSIOTHERAPY CLINIC
Ruko Rose Garden 7 No.11, JakaSetia
TREATMENT RECEIPT
__________________________________________
DATE: ${formatDateForPrint(invoice.date)}
Patient Name: ${invoice.patientName}
Address: ${patient.address || 'No address recorded'}
__________________________________________
TREATMENTS:
${invoice.treatments.map(treatment => {
  const price = formatCurrency(treatment.price).replace('Rp', 'RP');
  let treatmentText = `${treatment.name.toUpperCase()} ${price}`;
  if (treatment.notes) {
    treatmentText += `\nNotes: ${treatment.notes}`;
  }
  return treatmentText;
}).join('\n')}
__________________________________________
<div style="font-size: 14px; font-weight: bold;">TOTAL RP ${formatCurrency(invoice.totalAmount).replace('Rp', '').replace(/\s/g, '')}</div>

INVOICE NUMBER: ${invoice.invoiceNumber}
OPERATOR: ${invoice.operatorName}
STATUS: ${invoice.status.toUpperCase() === 'PAID' ? 'PAID' : invoice.status.toUpperCase()}
Thank you for your visit!
Semoga kesehatan selalu menyertai anda</div>`;

    // Replace body content with print content
    document.body.innerHTML = printContent;

    // Add print styles to head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @media print {
        html {
          margin: 0;
          padding: 0;
          height: 100%;
        }
        body {
          margin: 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.2;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          min-height: 100%;
          box-sizing: border-box;
        }
        @page {
          margin: 0 0 0 0.3in;
          size: auto;
        }
        * {
          box-sizing: border-box;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Trigger print dialog
    window.print();

    // Restore original content after print
    const restoreContent = () => {
      document.body.innerHTML = originalContent;
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };

    // Listen for print completion
    const mediaQueryList = window.matchMedia('print');
    const handlePrintEnd = (mql: MediaQueryListEvent) => {
      if (!mql.matches) {
        restoreContent();
        mediaQueryList.removeListener(handlePrintEnd);
        // Navigate back to invoices list after print is completed
        navigate('/invoices');
      }
    };
    mediaQueryList.addListener(handlePrintEnd);

    // Fallback: restore content and navigate back after 3 seconds
    setTimeout(() => {
      restoreContent();
      navigate('/invoices');
    }, 3000);
  };

  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography level="body-lg">Loading invoice details...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startDecorator={<ArrowBack />}
            onClick={() => navigate('/invoices')}
            sx={{ borderRadius: 'sm' }}
          >
            Back to Invoices
          </Button>
        </Box>
        <Card>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography level="h4" color="danger" sx={{ mb: 2 }}>
              {error || 'Invoice not found'}
            </Typography>
            <Typography level="body-sm" color="neutral" sx={{ mb: 3 }}>
              The invoice you're looking for doesn't exist or has been removed.
            </Typography>
            <Button
              variant="solid"
              onClick={() => navigate('/invoices')}
            >
              Back to Invoices
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      p: 2,
      boxSizing: 'border-box',
      minWidth: 0,
      maxWidth: '600px',
      mx: 'auto'
    }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startDecorator={<ArrowBack />}
            onClick={() => navigate('/invoices')}
            sx={{ borderRadius: 'sm' }}
          >
            Back to Invoices
          </Button>
          <Typography level="h2" sx={{ fontSize: '24px', ml: 2 }}>Invoice Details</Typography>
        </Box>
        <Button
          variant="solid"
          color="primary"
          startDecorator={<Print />}
          onClick={handlePrint}
          sx={{ borderRadius: 'sm' }}
        >
          Print
        </Button>
      </Box>

      {/* Receipt Layout */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          color: '#000000',
          p: 4,
          borderRadius: 'sm',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: 1.6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {/* Clinic Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography level="h3" sx={{ fontWeight: 'bold', mb: 1, color: '#000000' }}>
            BSP CENTER PHYSIOTHERAPY CLINIC
          </Typography>
          <Typography level="body-sm" sx={{ color: '#000000' }}>
            Ruko Rose Garden 7 No.11, JakaSetia, Bekasi Selatan 17148
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#000000', mb: 3 }} />

        {/* Receipt Title */}
        <Typography level="h4" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3, color: '#000000' }}>
          TREATMENT RECEIPT
        </Typography>

        {/* Patient Information */}
        <Box sx={{ mb: 3 }}>
          <Typography level="body-sm" sx={{ color: '#000000' }}>
            DATE: {formatDate(invoice.date)}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#000000' }}>
            RECORD NUMBER: {patient?.record_number || 'N/A'}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#000000' }}>
            Patient Name: {invoice.patientName}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#000000' }}>
            Address: {patient?.address || 'No address recorded'}
          </Typography>
        </Box>

        
        {/* Treatments Section */}
        <Box sx={{ mb: 2 }}>
          <Typography level="body-sm" sx={{ fontWeight: 'bold', color: '#000000' }}>
            TREATMENTS:
          </Typography>
        </Box>

        {/* Treatments with Prices */}
        <Box sx={{ mb: 3 }}>
          {invoice.treatments.map((treatment) => (
            <Box key={treatment.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography level="body-sm" sx={{ color: '#000000' }}>
                  {treatment.name.toUpperCase()}
                </Typography>
                <Typography level="body-sm" sx={{ color: '#000000' }}>
                  {formatCurrency(treatment.price).replace('Rp', 'RP')}
                </Typography>
              </Box>
              {treatment.notes && (
                <Typography level="body-xs" sx={{ color: '#000000', fontStyle: 'italic', ml: 2, mb: 1 }}>
                  Notes: {treatment.notes}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Total */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography level="body-sm" sx={{ fontWeight: 'bold', color: '#000000' }}>TOTAL</Typography>
            <Typography level="body-sm" sx={{ fontWeight: 'bold', color: '#000000' }}>
              {formatCurrency(invoice.totalAmount).replace('Rp', 'RP')}
            </Typography>
          </Box>
        </Box>

        {/* Additional Invoice Info */}
        <Box sx={{ mb: 3 }}>
          <Typography level="body-sm" sx={{ color: '#000000' }}>
            INVOICE NUMBER: {invoice.invoiceNumber}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#000000' }}>
            OPERATOR: {invoice.operatorName}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#000000' }}>
            STATUS: {invoice.status.toUpperCase()}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#000000', mb: 2 }} />

        {/* Thank You Message */}
        <Typography level="body-sm" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold', color: '#000000' }}>
          Thank you for your visit!
        </Typography>

        <Typography level="body-sm" sx={{ textAlign: 'center', fontStyle: 'italic', color: '#000000' }}>
          Semoga kesehatan selalu menyertai anda
        </Typography>
      </Box>

      {/* Invoice Status Control */}
      <Card sx={{ mt: 2, maxWidth: '600px', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography level="body-sm" sx={{ color: '#ffffff' }}>
            Invoice Status:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Select
              value={invoice.status}
              onChange={(_, newValue) => {
                if (newValue && (newValue === 'paid' || newValue === 'unpaid' || newValue === 'void')) {
                  updateInvoiceStatus(newValue);
                }
              }}
              disabled={isUpdating}
              sx={{
                minWidth: 120,
                color: '#ffffff',
                '& .MuiSelect-select': {
                  color: '#ffffff !important'
                }
              }}
            >
              <Option value="unpaid" sx={{ color: '#ffffff' }}>Unpaid</Option>
              <Option value="paid" sx={{ color: '#ffffff' }}>Paid</Option>
              <Option value="void" sx={{ color: '#ffffff' }}>Void</Option>
            </Select>
            {isUpdating && (
              <Typography level="body-sm" color="primary">Updating...</Typography>
            )}
          </Box>
        </Box>
      </Card>

      {/* Footer Info */}
      <Card sx={{ mt: 2, maxWidth: '600px', width: '100%' }}>
        <Typography level="body-xs" sx={{ textAlign: 'center', color: '#ffffff' }}>
          Created on {formatDate(invoice.created_at)}
          {invoice.updated_at && ` • Updated on ${formatDate(invoice.updated_at)}`}
        </Typography>
      </Card>
    </Box>
  );
};

export default InvoiceDetails;
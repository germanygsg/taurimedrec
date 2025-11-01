import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Add from '@mui/icons-material/Add';
import MonetizationOn from '@mui/icons-material/MonetizationOn';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { databaseService } from '../services/database';
import { Invoice } from '../types';

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

interface PatientStats {
  totalPatients: number;
  newThisMonth: number;
  monthlyData: { month: string; count: number }[];
}

interface AppointmentStats {
  totalAppointments: number;
  thisMonth: number;
  monthlyData: { month: string; count: number }[];
}

interface RevenueStats {
  totalRevenue: number;
  thisMonth: number;
  monthlyData: { month: string; revenue: number }[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PatientStats>({
    totalPatients: 0,
    newThisMonth: 0,
    monthlyData: []
  });
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    totalAppointments: 0,
    thisMonth: 0,
    monthlyData: []
  });
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    thisMonth: 0,
    monthlyData: []
  });
  
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load patient statistics
      const patients = await databaseService.getPatients();
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Calculate patients added this month
      const newThisMonth = patients.filter(patient => {
        if (!patient.created_at) return false;
        const createdDate = new Date(patient.created_at);
        return createdDate.getMonth() === currentMonth &&
               createdDate.getFullYear() === currentYear;
      }).length;

      // Generate monthly data for patients
      const patientMonthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const count = patients.filter(patient => {
          if (!patient.created_at) return false;
          const createdDate = new Date(patient.created_at);
          return createdDate >= monthStart && createdDate <= monthEnd;
        }).length;

        patientMonthlyData.push({ month: monthName, count });
      }

      setStats({
        totalPatients: patients.length,
        newThisMonth,
        monthlyData: patientMonthlyData
      });

      // Load appointment statistics
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

      // Calculate appointments this month
      const appointmentsThisMonth = appointments.filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.getMonth() === currentMonth &&
               appointmentDate.getFullYear() === currentYear;
      }).length;

      // Generate monthly data for appointments
      const appointmentMonthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const count = appointments.filter((appointment: Appointment) => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= monthStart && appointmentDate <= monthEnd;
        }).length;

        appointmentMonthlyData.push({ month: monthName, count });
      }

      setAppointmentStats({
        totalAppointments: appointments.length,
        thisMonth: appointmentsThisMonth,
        monthlyData: appointmentMonthlyData
      });

      // Load invoice statistics and calculate revenue
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const paidInvoices = invoices.filter((invoice: Invoice) => invoice.status === 'paid');

      // Calculate revenue this month
      const revenueThisMonth = paidInvoices.filter((invoice: Invoice) => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth &&
               invoiceDate.getFullYear() === currentYear;
      }).reduce((total: number, invoice: Invoice) => total + ((invoice.totalAmount || 0)), 0);

      // Generate monthly data for revenue
      const revenueMonthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const monthlyRevenue = paidInvoices
          .filter((invoice: Invoice) => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= monthStart && invoiceDate <= monthEnd;
          })
          .reduce((total: number, invoice: Invoice) => total + ((invoice.totalAmount || 0)), 0);

        revenueMonthlyData.push({ month: monthName, revenue: monthlyRevenue });
      }

      const totalRevenue = paidInvoices.reduce((total: number, invoice: Invoice) => total + (invoice.totalAmount || 0), 0);

      setRevenueStats({
        totalRevenue,
        thisMonth: revenueThisMonth,
        monthlyData: revenueMonthlyData
      });

    } catch (error) {
      console.error('Error loading stats:', error);
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


  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      p: 1.5,
      boxSizing: 'border-box',
      minWidth: 0
    }}>
      <Box sx={{ mb: 2 }}>
        <Typography level="h2" sx={{ mb: 1 }}>
          Welcome!
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' }, flexWrap: 'wrap' }}>
          {/* New Patients This Month Card */}
          <Card
            variant="outlined"
            sx={{
              p: 2,
              position: 'relative',
              overflow: 'visible',
              flex: 1,
              minWidth: { xs: '100%', lg: '300px' }
            }}
          >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2
          }}>
            <Box>
              <Typography level="h4" sx={{ mb: 0.5 }}>
                New Patients This Month
              </Typography>
              <Typography level="h2" color="primary" sx={{ mb: 0.5 }}>
                {stats.newThisMonth}
              </Typography>
              <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                Total patients: {stats.totalPatients}
              </Typography>
            </Box>

            <Button
              variant="solid"
              color="neutral"
              size="sm"
              startDecorator={<Add />}
              onClick={() => navigate('/patients/add')}
              sx={{
                borderRadius: 'sm',
                whiteSpace: 'nowrap'
              }}
            >
              Add a New Patient
            </Button>
          </Box>

          {/* Recharts Line Chart */}
          <Box sx={{ mt: 1 }}>
            <Box sx={{
              width: '100%',
              height: 240,
              backgroundColor: 'background.level1',
              borderRadius: 'sm',
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.monthlyData}
                  margin={{ top: 15, right: 20, left: 15, bottom: 15 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--joy-palette-neutral-outlinedBorder)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--joy-palette-text-secondary)"
                    tick={{ fill: 'var(--joy-palette-text-secondary)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="var(--joy-palette-text-secondary)"
                    tick={{ fill: 'var(--joy-palette-text-secondary)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--joy-palette-background-level1)',
                      border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
                      borderRadius: '8px',
                      color: 'var(--joy-palette-text-primary)'
                    }}
                    labelStyle={{ color: 'var(--joy-palette-text-primary)' }}
                  />
                  <Legend
                    wrapperStyle={{ color: 'var(--joy-palette-text-primary)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--joy-palette-primary-500)"
                    strokeWidth={3}
                    dot={{
                      fill: 'var(--joy-palette-primary-500)',
                      strokeWidth: 2,
                      r: 5
                    }}
                    activeDot={{ r: 7 }}
                    name="New Patients"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          </Card>

          {/* Appointments This Month Card */}
          <Card
            variant="outlined"
            sx={{
              p: 2,
              position: 'relative',
              overflow: 'visible',
              flex: 1,
              minWidth: { xs: '100%', md: '0' }
            }}
          >
          <Box sx={{ mb: 2 }}>
            <Typography level="h4" sx={{ mb: 0.5 }}>
              Appointments This Month
            </Typography>
            <Typography level="h2" color="success" sx={{ mb: 0.5 }}>
              {appointmentStats.thisMonth}
            </Typography>
            <Typography level="body-sm" sx={{ color: '#ffffff' }}>
              Total appointments: {appointmentStats.totalAppointments}
            </Typography>
          </Box>

          {/* Recharts Line Chart for Appointments */}
          <Box sx={{ mt: 1 }}>
            <Box sx={{
              width: '100%',
              height: 240,
              backgroundColor: 'background.level1',
              borderRadius: 'sm',
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={appointmentStats.monthlyData}
                  margin={{ top: 15, right: 20, left: 15, bottom: 15 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--joy-palette-neutral-outlinedBorder)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--joy-palette-text-secondary)"
                    tick={{ fill: 'var(--joy-palette-text-secondary)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="var(--joy-palette-text-secondary)"
                    tick={{ fill: 'var(--joy-palette-text-secondary)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--joy-palette-background-level1)',
                      border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
                      borderRadius: '8px',
                      color: 'var(--joy-palette-text-primary)'
                    }}
                    labelStyle={{ color: 'var(--joy-palette-text-primary)' }}
                  />
                  <Legend
                    wrapperStyle={{ color: 'var(--joy-palette-text-primary)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--joy-palette-success-500)"
                    strokeWidth={3}
                    dot={{
                      fill: 'var(--joy-palette-success-500)',
                      strokeWidth: 2,
                      r: 5
                    }}
                    activeDot={{ r: 7 }}
                    name="Appointments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          </Card>
        </Box>

        {/* Second Row - Revenue Card */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' }, flexWrap: 'wrap' }}>
          {/* Revenue This Month Card */}
          <Card
            variant="outlined"
            sx={{
              p: 2,
              position: 'relative',
              overflow: 'visible',
              flex: 1,
              minWidth: { xs: '100%', lg: '300px' }
            }}
          >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2
          }}>
            <Box>
              <Typography level="h4" sx={{ mb: 0.5 }}>
                Revenue This Month
              </Typography>
              <Typography level="h2" color="success" sx={{ mb: 0.5 }}>
                {formatCurrency(revenueStats.thisMonth)}
              </Typography>
              <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                Total revenue: {formatCurrency(revenueStats.totalRevenue)}
              </Typography>
            </Box>

            <Button
              variant="solid"
              color="neutral"
              size="sm"
              startDecorator={<MonetizationOn />}
              onClick={() => navigate('/invoices')}
              sx={{
                borderRadius: 'sm',
                whiteSpace: 'nowrap'
              }}
            >
              View Invoices
            </Button>
          </Box>

          {/* Recharts Revenue Chart */}
          <Box sx={{ mt: 1 }}>
            <Box sx={{
              width: '100%',
              height: 240,
              backgroundColor: 'background.level1',
              borderRadius: 'sm',
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueStats.monthlyData}
                  margin={{ top: 15, right: 20, left: 15, bottom: 15 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--joy-palette-neutral-outlinedBorder)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--joy-palette-text-secondary)"
                    tick={{ fill: 'var(--joy-palette-text-secondary)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="var(--joy-palette-text-secondary)"
                    tick={{ fill: 'var(--joy-palette-text-secondary)', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--joy-palette-background-level1)',
                      border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
                      borderRadius: '8px',
                      color: 'var(--joy-palette-text-primary)'
                    }}
                    labelStyle={{ color: 'var(--joy-palette-text-primary)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Legend
                    wrapperStyle={{ color: 'var(--joy-palette-text-primary)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--joy-palette-primary-500)"
                    strokeWidth={3}
                    dot={{
                      fill: 'var(--joy-palette-primary-500)',
                      strokeWidth: 2,
                      r: 5
                    }}
                    activeDot={{ r: 7 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          </Card>
        </Box>

      </Stack>

      {/* Floating New Appointment Button */}
      <Button
        color="primary"
        variant="solid"
        onClick={() => navigate('/appointments/new')}
        startDecorator={<Add />}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          borderRadius: 28,
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '12px 20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)'
          },
          '&:active': {
            transform: 'scale(0.98)'
          }
        }}
      >
        New Appointment
      </Button>
    </Box>
  );
};

export default Dashboard;
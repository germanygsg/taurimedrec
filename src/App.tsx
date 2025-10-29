import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  CssVarsProvider,
  extendTheme,
} from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { SidebarProvider } from './contexts/SidebarContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import AddPatient from './pages/AddPatient';
import PatientDetails from './pages/PatientDetails';
import EditPatient from './pages/EditPatient';
import Settings from './pages/Settings';
import Appointments from './pages/Appointments';
import NewAppointment from './pages/NewAppointment';
import AppointmentDetails from './pages/AppointmentDetails';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import Reports from './pages/Reports';
import { createSampleLogs } from './utils/sampleLogs';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#F8F9FB',
          100: '#F1F3F7',
          200: '#E9EDF3',
          300: '#E1E6EF',
          400: '#D9DFE7',
          500: '#1d293d',
          600: '#1A2332',
          700: '#ffffff',
          800: '#13171E',
          900: '#0F1114',
        },
        background: {
          body: '#020618',
          surface: '#0f172b',
        },
        text: {
          primary: '#ffffff',
          secondary: '#ffffff',
          tertiary: '#ffffff',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: '#F8F9FB',
          100: '#F1F3F7',
          200: '#E9EDF3',
          300: '#E1E6EF',
          400: '#D9DFE7',
          500: '#1d293d',
          600: '#1A2332',
          700: '#ffffff',
          800: '#13171E',
          900: '#0F1114',
        },
        background: {
          body: '#020618',
          surface: '#0f172b',
        },
        neutral: {
          50: '#1d293d',
          100: '#1A2332',
          200: '#ffffff',
          300: '#13171E',
          400: '#0F1114',
          500: '#0C0B0F',
          600: '#09080A',
          700: '#060506',
          800: '#020618',
          900: '#000000',
        },
        text: {
          primary: '#ffffff',
          secondary: '#ffffff',
          tertiary: '#ffffff',
        },
      },
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant === 'solid' && ownerState.color === 'primary' && {
            backgroundColor: '#1d293d',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1A2332',
            },
          }),
          ...(ownerState.variant === 'solid' && ownerState.color === 'neutral' && {
            backgroundColor: '#1d293d',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1A2332',
            },
          }),
          ...(ownerState.variant === 'outlined' && ownerState.color === 'neutral' && {
            borderColor: '#1d293d',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1d293d',
              color: '#ffffff',
            },
          }),
          ...(ownerState.variant === 'soft' && ownerState.color === 'primary' && {
            backgroundColor: 'rgba(29, 41, 61, 0.1)',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(29, 41, 61, 0.2)',
            },
          }),
        }),
      },
    },
  },
});

function App() {
  // Initialize sample logs on first load
  React.useEffect(() => {
    createSampleLogs();
  }, []);

  return (
    <CssVarsProvider
      theme={theme}
      defaultMode="dark"
      modeStorageKey="patient-management-theme"
      disableTransitionOnChange
    >
      <CssBaseline />
      <SidebarProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="patients" element={<PatientList />} />
              <Route path="patients/add" element={<AddPatient />} />
              <Route path="patients/:id" element={<PatientDetails />} />
              <Route path="patients/:id/edit" element={<EditPatient />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="appointments/new" element={<NewAppointment />} />
              <Route path="appointments/:id" element={<AppointmentDetails />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/:id" element={<InvoiceDetails />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          </Router>
      </SidebarProvider>
    </CssVarsProvider>
  );
}

export default App;
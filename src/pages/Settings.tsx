import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Table from '@mui/joy/Table';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import FormLabel from '@mui/joy/FormLabel';
import FormControl from '@mui/joy/FormControl';
import Stack from '@mui/joy/Stack';
import Alert from '@mui/joy/Alert';
import IconButton from '@mui/joy/IconButton';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import Download from '@mui/icons-material/Download';
import Upload from '@mui/icons-material/Upload';
import Warning from '@mui/icons-material/Warning';
import History from '@mui/icons-material/History';
import Close from '@mui/icons-material/Close';
import Person from '@mui/icons-material/Person';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Receipt from '@mui/icons-material/Receipt';
import Badge from '@mui/joy/Badge';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import Chip from '@mui/joy/Chip';
import * as XLSX from 'xlsx';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';
import { isTauriEnvironment, importTauriDialog, importTauriFs } from '../utils/tauriUtils';
import { useNavigate } from 'react-router-dom';

interface Operator {
  id: number;
  name: string;
  role: string;
  created_at: string;
}

interface Treatment {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
}

interface LogEntry {
  id: number;
  action: string;
  operatorName: string;
  targetType: 'patient' | 'appointment' | 'invoice';
  targetId?: number;
  targetName?: string;
  patientId?: number;
  patientName?: string;
  timestamp: string;
  details?: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [operatorFormData, setOperatorFormData] = useState({
    name: '',
    role: ''
  });
  const [treatmentFormData, setTreatmentFormData] = useState({
    name: '',
    description: '',
    price: ''
  });
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  useEffect(() => {
    loadData();
    loadLogs();
    // Set up an interval to check for new logs
    const interval = setInterval(loadLogs, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Load operators
      const operatorsRaw = localStorage.getItem('operators');
      const storedOperators: Operator[] = JSON.parse(operatorsRaw || '[]');
      setOperators(storedOperators);

      // Load treatments
      const treatmentsRaw = localStorage.getItem('treatments');
      const storedTreatments: Treatment[] = JSON.parse(treatmentsRaw || '[]');
      setTreatments(storedTreatments);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = () => {
    try {
      const storedLogs = localStorage.getItem('activity_logs');
      if (storedLogs) {
        const logsData: LogEntry[] = JSON.parse(storedLogs);
        setLogs(logsData);
        // Calculate unread logs (logs from last session)
        const lastSeen = localStorage.getItem('logs_last_seen') || '0';
        const unreadLogs = logsData.filter(log => log.id > parseInt(lastSeen));
        setUnreadCount(unreadLogs.length);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const markAsRead = () => {
    if (logs.length > 0) {
      const latestLogId = Math.max(...logs.map(log => log.id));
      localStorage.setItem('logs_last_seen', latestLogId.toString());
      setUnreadCount(0);
    }
  };

  const handleOperatorInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setOperatorFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleTreatmentInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setTreatmentFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddOperator = () => {
    setEditingOperator(null);
    setOperatorFormData({ name: '', role: '' });
    setIsOperatorModalOpen(true);
  };

  const handleEditOperator = (operator: Operator) => {
    setEditingOperator(operator);
    setOperatorFormData({ name: operator.name, role: operator.role });
    setIsOperatorModalOpen(true);
  };

  const handleAddTreatment = () => {
    setEditingTreatment(null);
    setTreatmentFormData({ name: '', description: '', price: '' });
    setIsTreatmentModalOpen(true);
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setTreatmentFormData({
      name: treatment.name,
      description: treatment.description,
      price: treatment.price.toString()
    });
    setIsTreatmentModalOpen(true);
  };

  const handleDeleteOperator = (operator: Operator) => {
    if (window.confirm(`Are you sure you want to delete operator "${operator.name}"?`)) {
      try {
        const updatedOperators = operators.filter(op => op.id !== operator.id);
        localStorage.setItem('operators', JSON.stringify(updatedOperators));
        setOperators(updatedOperators);
      } catch (error) {
        setError('Failed to delete operator');
      }
    }
  };

  const handleDeleteTreatment = (treatment: Treatment) => {
    if (window.confirm(`Are you sure you want to delete treatment "${treatment.name}"?`)) {
      try {
        const updatedTreatments = treatments.filter(t => t.id !== treatment.id);
        localStorage.setItem('treatments', JSON.stringify(updatedTreatments));
        setTreatments(updatedTreatments);
      } catch (error) {
        setError('Failed to delete treatment');
      }
    }
  };

  const handleOperatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!operatorFormData.name.trim()) {
      setError('Operator name is required');
      return;
    }

    if (!operatorFormData.role.trim()) {
      setError('Role is required');
      return;
    }

    try {
      if (editingOperator) {
        // Update existing operator
        const updatedOperators = operators.map(op =>
          op.id === editingOperator.id
            ? { ...op, name: operatorFormData.name.trim(), role: operatorFormData.role.trim() }
            : op
        );
        localStorage.setItem('operators', JSON.stringify(updatedOperators));
        setOperators(updatedOperators);
      } else {
        // Add new operator
        const newOperator: Operator = {
          id: Date.now(), // Simple ID generation
          name: operatorFormData.name.trim(),
          role: operatorFormData.role.trim(),
          created_at: new Date().toISOString()
        };
        const updatedOperators = [...operators, newOperator];
        localStorage.setItem('operators', JSON.stringify(updatedOperators));
        setOperators(updatedOperators);
      }

      setIsOperatorModalOpen(false);
      setOperatorFormData({ name: '', role: '' });
      setEditingOperator(null);
      setError(null);
    } catch (error) {
      setError(editingOperator ? 'Failed to update operator' : 'Failed to add operator');
    }
  };

  const handleTreatmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!treatmentFormData.name.trim()) {
      setError('Treatment name is required');
      return;
    }

    if (!treatmentFormData.description.trim()) {
      setError('Description is required');
      return;
    }

    const price = parseFloat(treatmentFormData.price);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      if (editingTreatment) {
        // Update existing treatment
        const updatedTreatments = treatments.map(t =>
          t.id === editingTreatment.id
            ? { ...t, name: treatmentFormData.name.trim(), description: treatmentFormData.description.trim(), price }
            : t
        );
        localStorage.setItem('treatments', JSON.stringify(updatedTreatments));
        setTreatments(updatedTreatments);
      } else {
        // Add new treatment
        const newTreatment: Treatment = {
          id: Date.now(), // Simple ID generation
          name: treatmentFormData.name.trim(),
          description: treatmentFormData.description.trim(),
          price: price,
          created_at: new Date().toISOString()
        };
        const updatedTreatments = [...treatments, newTreatment];
        localStorage.setItem('treatments', JSON.stringify(updatedTreatments));
        setTreatments(updatedTreatments);
      }

      setIsTreatmentModalOpen(false);
      setTreatmentFormData({ name: '', description: '', price: '' });
      setEditingTreatment(null);
      setError(null);
    } catch (error) {
      setError(editingTreatment ? 'Failed to update treatment' : 'Failed to add treatment');
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getActionIcon = (action: string) => {
    if (action.includes('new') || action.includes('created')) return <Add />;
    if (action.includes('edit') || action.includes('updated')) return <Edit />;
    if (action.includes('delete') || action.includes('removed')) return <Delete />;
    return null;
  };

  const getActionColor = (action: string) => {
    if (action.includes('new') || action.includes('created')) return 'success';
    if (action.includes('edit') || action.includes('updated')) return 'warning';
    if (action.includes('delete') || action.includes('removed')) return 'danger';
    return 'neutral';
  };

  const formatLogMessage = (log: LogEntry) => {
    // Check if this is a destructive action (edit/delete) - don't create links for these
    const isDestructiveAction = log.action.toLowerCase().includes('edit') ||
                               log.action.toLowerCase().includes('update') ||
                               log.action.toLowerCase().includes('delete') ||
                               log.action.toLowerCase().includes('remove') ||
                               log.action.toLowerCase().includes('deleted') ||
                               log.action.toLowerCase().includes('updated');

    // Build the message piece by piece to avoid spacing issues
    const elements = [];
    const words = log.action.split(' ');

    // Replace entity names and patient names as we process
    let processedPatientName = false;
    let skipWords = 0;

    words.forEach((word, index) => {
      // Skip words if we're in a skip sequence
      if (skipWords > 0) {
        skipWords--;
        return;
      }

      const lowerWord = word.toLowerCase();

      // Check if this word is the start of the patient name
      if (log.patientName && !processedPatientName) {
        const nameParts = log.patientName.toLowerCase().split(' ');
        const remainingWords = words.slice(index).map(w => w.toLowerCase()).join(' ');

        // Check if the remaining text starts with the patient name
        if (remainingWords.startsWith(nameParts.join(' '))) {
          // This is the patient name - add the full patient name
          if (!isDestructiveAction && log.patientId) {
            elements.push(
              <Typography
                key={`patient-${index}`}
                component="a"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/patients/${log.patientId}`);
                }}
                sx={{
                  color: 'primary.500',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.300' }
                }}
              >
                {log.patientName}
              </Typography>
            );
          } else {
            elements.push(
              <Typography key={`patient-${index}`} component="span" sx={{ fontWeight: 'bold' }}>
                {log.patientName}
              </Typography>
            );
          }
          processedPatientName = true;

          // Skip the remaining parts of the patient name (excluding the first word we just processed)
          skipWords = nameParts.length - 1;
        } else {
          // Not a patient name match, process as regular word
          elements.push(
            <Typography key={`word-${index}`} component="span">
              {word}
            </Typography>
          );
        }
      }
      // Check if this is an entity word that should be styled
      else if ((lowerWord === 'appointment' || lowerWord === 'patient' || lowerWord === 'invoice') &&
               log.targetType === lowerWord && log.targetId) {
        if (!isDestructiveAction) {
          // Create clickable link for non-destructive actions
          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (lowerWord === 'appointment') navigate(`/appointments/${log.targetId}`);
            else if (lowerWord === 'patient') navigate(`/patients/${log.targetId}`);
            else if (lowerWord === 'invoice') navigate(`/invoices/${log.targetId}`);
          };

          elements.push(
            <Typography
              key={`${lowerWord}-${index}`}
              component="a"
              href="#"
              onClick={handleClick}
              sx={{
                color: 'primary.500',
                textDecoration: 'underline',
                cursor: 'pointer',
                '&:hover': { color: 'primary.300' }
              }}
            >
              {word}
            </Typography>
          );
        } else {
          // Just bold text for destructive actions
          elements.push(
            <Typography key={`${lowerWord}-${index}`} component="span" sx={{ fontWeight: 'bold' }}>
              {word}
            </Typography>
          );
        }
      }
      // Regular word
      else {
        elements.push(
          <Typography key={`word-${index}`} component="span">
            {word}
          </Typography>
        );
      }

      // Add space after each word except the last one
      if (index < words.length - 1) {
        elements.push(
          <Typography key={`space-${index}`} component="span">
            {' '}
          </Typography>
        );
      }
    });

    return elements;
  };

  const handleBackup = async () => {
    try {
      // Collect all data
      const backupData = {
        operators: JSON.parse(localStorage.getItem('operators') || '[]'),
        treatments: JSON.parse(localStorage.getItem('treatments') || '[]'),
        patients: JSON.parse(localStorage.getItem('patient_management_data') || '[]'),
        appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
        invoices: JSON.parse(localStorage.getItem('invoices') || '[]'),
        backupDate: new Date().toISOString(),
        version: '1.0'
      };

      // Check if running in Tauri environment
      if (isTauriEnvironment()) {
        // Tauri environment - use native file dialog
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const defaultFilename = `patient-management-backup-${timestamp}.json`;

        // Import Tauri APIs using utility functions
        const dialogModule = await importTauriDialog();
        const fsModule = await importTauriFs();
        const { save } = dialogModule;
        const { writeFile } = fsModule;

        // Show save dialog
        const filePath = await save({
          title: 'Save Backup File',
          defaultPath: defaultFilename,
          filters: [
            {
              name: 'JSON Files',
              extensions: ['json']
            },
            {
              name: 'All Files',
              extensions: ['*']
            }
          ]
        });

        if (filePath) {
          // Convert data to JSON string
          const jsonString = JSON.stringify(backupData, null, 2);
          await writeFile(filePath, jsonString);
          alert('Backup created successfully!');
        }
      } else {
        // Web environment - use browser download
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
          type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `patient-management-backup-${timestamp}.json`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('Backup created successfully!');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed. Please try again.');
    }
  };

  const handleExportToExcel = async () => {
    try {
      // Load patients data
      const patientsRaw = localStorage.getItem('patient_management_data');
      const patients = JSON.parse(patientsRaw || '[]');

      if (patients.length === 0) {
        alert('No patient data available to export.');
        return;
      }

      // Prepare data for Excel export
      const excelData = patients.map((patient: any) => ({
        'Record Number': patient.record_number || '',
        'Name': patient.name || '',
        'Age': patient.age || '',
        'Address': patient.address || '',
        'Phone Number': patient.phone_number || '',
        'Initial Diagnosis': patient.initial_diagnosis || '',
        'Created At': patient.created_at ? new Date(patient.created_at).toLocaleString() : ''
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Patients');

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Record Number
        { wch: 30 }, // Name
        { wch: 8 },  // Age
        { wch: 40 }, // Address
        { wch: 15 }, // Phone Number
        { wch: 30 }, // Initial Diagnosis
        { wch: 20 }  // Created At
      ];
      ws['!cols'] = colWidths;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `patients-export-${timestamp}.xlsx`;

      // Check if running in Tauri environment
      if (isTauriEnvironment()) {
        // Tauri environment - use native file dialog
        const dialogModule = await importTauriDialog();
        const fsModule = await importTauriFs();
        const { save } = dialogModule;
        const { writeFile } = fsModule;

        // Show save dialog
        const filePath = await save({
          title: 'Export Patients to Excel',
          defaultPath: filename,
          filters: [
            {
              name: 'Excel Files',
              extensions: ['xlsx']
            },
            {
              name: 'All Files',
              extensions: ['*']
            }
          ]
        });

        if (filePath) {
          // Convert workbook to Excel file
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
          await writeFile(filePath, excelBuffer);
          alert('Patients data exported to Excel successfully!');
        }
      } else {
        // Web environment - use browser download
        XLSX.writeFile(wb, filename);
        alert('Patients data exported to Excel successfully!');
      }
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Excel export failed. Please try again.');
    }
  };

  const handleExportInvoicesToExcel = async () => {
    try {
      // Load invoices data
      const invoicesRaw = localStorage.getItem('invoices');
      const invoices = JSON.parse(invoicesRaw || '[]');

      if (invoices.length === 0) {
        alert('No invoice data available to export.');
        return;
      }

      // Prepare data for Excel export
      const excelData = invoices.map((invoice: any) => ({
        'Invoice Number': invoice.invoiceNumber || '',
        'Patient Name': invoice.patientName || '',
        'Operator Name': invoice.operatorName || '',
        'Date & Time': invoice.date ? new Date(invoice.date).toLocaleString() : '',
        'Appointment Date': invoice.appointmentDate ? new Date(invoice.appointmentDate).toLocaleDateString() : '',
        'Total Amount': invoice.totalAmount || 0,
        'Status': invoice.status || '',
        'Vital Signs - BP': invoice.vitalSigns?.bloodPressure || '',
        'Vital Signs - RR': invoice.vitalSigns?.respirationRate || '',
        'Vital Signs - HR': invoice.vitalSigns?.heartRate || '',
        'Vital Signs - Borg': invoice.vitalSigns?.borgScale || '',
        'Treatments Count': invoice.treatments?.length || 0,
        'Treatments List': invoice.treatments?.map((t: any) => `${t.name} (${formatCurrency(t.price)})`).join(', ') || '',
        'Created At': invoice.created_at ? new Date(invoice.created_at).toLocaleString() : ''
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Invoices');

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Invoice Number
        { wch: 25 }, // Patient Name
        { wch: 20 }, // Operator Name
        { wch: 20 }, // Date & Time
        { wch: 15 }, // Appointment Date
        { wch: 15 }, // Total Amount
        { wch: 10 }, // Status
        { wch: 12 }, // Vital Signs - BP
        { wch: 8 },  // Vital Signs - RR
        { wch: 8 },  // Vital Signs - HR
        { wch: 8 },  // Vital Signs - Borg
        { wch: 15 }, // Treatments Count
        { wch: 40 }, // Treatments List
        { wch: 20 }  // Created At
      ];
      ws['!cols'] = colWidths;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `invoices-export-${timestamp}.xlsx`;

      // Check if running in Tauri environment
      if (isTauriEnvironment()) {
        // Tauri environment - use native file dialog
        const dialogModule = await importTauriDialog();
        const fsModule = await importTauriFs();
        const { save } = dialogModule;
        const { writeFile } = fsModule;

        // Show save dialog
        const filePath = await save({
          title: 'Export Invoices to Excel',
          defaultPath: filename,
          filters: [
            {
              name: 'Excel Files',
              extensions: ['xlsx']
            },
            {
              name: 'All Files',
              extensions: ['*']
            }
          ]
        });

        if (filePath) {
          // Convert workbook to Excel file
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
          await writeFile(filePath, excelBuffer);
          alert('Invoices data exported to Excel successfully!');
        }
      } else {
        // Web environment - use browser download
        XLSX.writeFile(wb, filename);
        alert('Invoices data exported to Excel successfully!');
      }
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Excel export failed. Please try again.');
    }
  };

  const handleDeleteAllData = () => {
    setIsDeleteAllModalOpen(true);
    setDeleteConfirmationText('');
  };

  const confirmDeleteAllData = () => {
    if (deleteConfirmationText !== 'DELETE ALL DATA') {
      alert('Please type "DELETE ALL DATA" exactly to confirm this action.');
      return;
    }

    try {
      // Clear all localStorage data
      localStorage.removeItem('operators');
      localStorage.removeItem('treatments');
      localStorage.removeItem('patient_management_data');
      localStorage.removeItem('appointments');
      localStorage.removeItem('invoices');

      // Close modal and reset state
      setIsDeleteAllModalOpen(false);
      setDeleteConfirmationText('');

      // Reload the page to reset the application state
      alert('All data has been permanently deleted. The application will now reload.');
      window.location.reload();
    } catch (error) {
      console.error('Delete all data failed:', error);
      alert('Failed to delete all data. Please try again.');
    }
  };

  const handleRestore = async () => {
    try {
      // Check if running in Tauri environment
      if (isTauriEnvironment()) {
        // Tauri environment - use native file dialog
        const dialogModule = await importTauriDialog();
        const fsModule = await importTauriFs();
        const { open } = dialogModule;
        const { readFile } = fsModule;

        // Show open dialog
        const selectedPath = await open({
          title: 'Select Backup File',
          multiple: false,
          filters: [
            {
              name: 'JSON Files',
              extensions: ['json']
            },
            {
              name: 'All Files',
              extensions: ['*']
            }
          ]
        });

        if (selectedPath) {
          // Read the selected file using Tauri's API
          const content = await readFile(selectedPath);
          const backupData = JSON.parse(content as string);

          // Validate backup structure
          if (!backupData.operators || !backupData.treatments || !backupData.patients ||
              !backupData.appointments || !backupData.invoices) {
            throw new Error('Invalid backup file structure');
          }

          // Confirm restore
          if (confirm('Are you sure you want to restore this backup? This will overwrite all existing data.')) {
            // Restore data to localStorage
            localStorage.setItem('operators', JSON.stringify(backupData.operators));
            localStorage.setItem('treatments', JSON.stringify(backupData.treatments));
            localStorage.setItem('patient_management_data', JSON.stringify(backupData.patients));
            localStorage.setItem('appointments', JSON.stringify(backupData.appointments));
            localStorage.setItem('invoices', JSON.stringify(backupData.invoices));

            // Reload data
            loadData();

            alert('Backup restored successfully! The page will be refreshed.');
            window.location.reload();
          }
        }
      } else {
        // Web environment - use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const backupData = JSON.parse(content);

              // Validate backup structure
              if (!backupData.operators || !backupData.treatments || !backupData.patients ||
                  !backupData.appointments || !backupData.invoices) {
                throw new Error('Invalid backup file structure');
              }

              // Confirm restore
              if (confirm('Are you sure you want to restore this backup? This will overwrite all existing data.')) {
                // Restore data to localStorage
                localStorage.setItem('operators', JSON.stringify(backupData.operators));
                localStorage.setItem('treatments', JSON.stringify(backupData.treatments));
                localStorage.setItem('patient_management_data', JSON.stringify(backupData.patients));
                localStorage.setItem('appointments', JSON.stringify(backupData.appointments));
                localStorage.setItem('invoices', JSON.stringify(backupData.invoices));

                // Reload data
                loadData();

                alert('Backup restored successfully! The page will be refreshed.');
                window.location.reload();
              }
            } catch (error) {
              console.error('Restore failed:', error);
              alert('Restore failed. Please ensure you selected a valid backup file.');
            }
          };

          reader.readAsText(file);
        };

        // Trigger file selection dialog
        input.click();
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Restore failed. Please ensure you selected a valid backup file.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography level="body-lg">Loading settings...</Typography>
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
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ mb: 3 }}>
        <Typography level="h2">Settings</Typography>
      </Box>

      {error && (
        <Alert color="danger" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs defaultValue="operators" sx={{ width: '100%', flexGrow: 1 }}>
        <TabList sx={{ borderRadius: 'sm', p: 1, mb: 2 }}>
          <Tab value="operators" sx={{ color: '#ffffff' }}>Operators</Tab>
          <Tab value="treatments" sx={{ color: '#ffffff' }}>Treatments</Tab>
          <Tab value="backup" sx={{ color: '#ffffff' }}>Backup & Restore</Tab>
          <Tab value="logs" sx={{ color: '#ffffff' }}>Activity Logs</Tab>
        </TabList>

        <TabPanel value="operators">
          {/* Operator Management Card */}
          <Card>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography level="h4">Operator Management</Typography>
                <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                  Manage system operators and their roles
                </Typography>
              </Box>
              <Button
                variant="solid"
                color="primary"
                startDecorator={<Add />}
                onClick={handleAddOperator}
              >
                Add Operator
              </Button>
            </Box>

            {operators.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography level="body-lg" sx={{ color: '#ffffff', mb: 2 }}>
                  No operators found
                </Typography>
                <Button
                  variant="outlined"
                  startDecorator={<Add />}
                  onClick={handleAddOperator}
                >
                  Add First Operator
                </Button>
              </Box>
            ) : (
              <Table
                stripe="odd"
                sx={{
                  '& tbody tr:hover': {
                    backgroundColor: 'background.level1',
                  },
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: '30%', color: '#ffffff' }}>Name</th>
                    <th style={{ width: '30%', color: '#ffffff' }}>Role</th>
                    <th style={{ width: '30%', color: '#ffffff' }}>Added Date</th>
                    <th style={{ width: '10%', color: '#ffffff' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.map((operator) => (
                    <tr key={operator.id}>
                      <td>
                        <Typography level="body-sm" fontWeight="bold">
                          {operator.name}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                          {operator.role}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                          {new Date(operator.created_at).toLocaleDateString()}
                        </Typography>
                      </td>
                      <td>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="sm"
                            variant="outlined"
                            color="neutral"
                            onClick={() => handleEditOperator(operator)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="outlined"
                            color="danger"
                            onClick={() => handleDeleteOperator(operator)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </TabPanel>

        <TabPanel value="treatments">
          {/* Treatment Management Card */}
          <Card>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography level="h4">Treatment Management</Typography>
                <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                  Manage available treatments and their pricing
                </Typography>
              </Box>
              <Button
                variant="solid"
                color="primary"
                startDecorator={<Add />}
                onClick={handleAddTreatment}
              >
                Add Treatment
              </Button>
            </Box>

            {treatments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography level="body-lg" sx={{ color: '#ffffff', mb: 2 }}>
                  No treatments available
                </Typography>
                <Button
                  variant="outlined"
                  startDecorator={<Add />}
                  onClick={handleAddTreatment}
                >
                  Add First Treatment
                </Button>
              </Box>
            ) : (
              <Table
                stripe="odd"
                sx={{
                  '& tbody tr:hover': {
                    backgroundColor: 'background.level1',
                  },
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: '30%', color: '#ffffff' }}>Treatment Name</th>
                    <th style={{ width: '40%', color: '#ffffff' }}>Description</th>
                    <th style={{ width: '20%', color: '#ffffff' }}>Price</th>
                    <th style={{ width: '10%', color: '#ffffff' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {treatments.map((treatment) => (
                    <tr key={treatment.id}>
                      <td>
                        <Typography level="body-sm" fontWeight="bold">
                          {treatment.name}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                          {treatment.description}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm" color="success" fontWeight="bold">
                          {formatCurrency(treatment.price)}
                        </Typography>
                      </td>
                      <td>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="sm"
                            variant="outlined"
                            color="neutral"
                            onClick={() => handleEditTreatment(treatment)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="outlined"
                            color="danger"
                            onClick={() => handleDeleteTreatment(treatment)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </TabPanel>

        <TabPanel value="backup">
          {/* Backup & Restore Card */}
          <Card>
            <Box sx={{ mb: 4 }}>
              <Typography level="h4" sx={{ mb: 1 }}>Backup & Restore</Typography>
              <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                Export and import all your application data including operators, treatments, patients, appointments, and invoices.
              </Typography>
            </Box>

            <Stack spacing={3}>
              {/* Backup Section */}
              <Box sx={{ p: 3, backgroundColor: 'background.level1', borderRadius: 'sm' }}>
                <Typography level="h5" sx={{ mb: 2, color: '#ffffff' }}>
                  📤 Backup Data
                </Typography>
                <Typography level="body-sm" sx={{ color: '#ffffff', mb: 3 }}>
                  Export all application data to a JSON file for safekeeping or migration.
                </Typography>
                <Button
                  variant="solid"
                  color="primary"
                  startDecorator={<Download />}
                  onClick={handleBackup}
                  sx={{ borderRadius: 'sm' }}
                >
                  Create Backup
                </Button>
              </Box>

              {/* Restore Section */}
              <Box sx={{ p: 3, backgroundColor: 'background.level1', borderRadius: 'sm' }}>
                <Typography level="h5" sx={{ mb: 2, color: '#ffffff' }}>
                  📥 Restore Data
                </Typography>
                <Typography level="body-sm" sx={{ color: '#ffffff', mb: 3 }}>
                  Import application data from a previously created JSON backup file.
                </Typography>
                <Button
                  variant="outlined"
                  color="neutral"
                  startDecorator={<Upload sx={{ color: '#ffffff' }} />}
                  onClick={handleRestore}
                  sx={{ borderRadius: 'sm' }}
                >
                  Restore from Backup
                </Button>
              </Box>

              {/* Excel Export Section */}
              <Box sx={{ p: 3, backgroundColor: 'background.level1', borderRadius: 'sm' }}>
                <Typography level="h5" sx={{ mb: 2, color: '#ffffff' }}>
                  📊 Export to Excel
                </Typography>
                <Typography level="body-sm" sx={{ color: '#ffffff', mb: 3 }}>
                  Export data to Excel format for analysis or reporting.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="solid"
                    color="success"
                    startDecorator={<Download />}
                    onClick={handleExportToExcel}
                    sx={{ borderRadius: 'sm' }}
                  >
                    Export Patients to Excel
                  </Button>
                  <Button
                    variant="solid"
                    color="primary"
                    startDecorator={<Download />}
                    onClick={handleExportInvoicesToExcel}
                    sx={{ borderRadius: 'sm' }}
                  >
                    Export Invoices to Excel
                  </Button>
                </Box>
              </Box>

              {/* Delete All Data Section */}
              <Box sx={{ p: 3, backgroundColor: 'danger.softBg', borderRadius: 'sm', border: '1px solid', borderColor: 'danger.outlinedBorder' }}>
                <Typography level="h5" sx={{ mb: 2, color: 'danger.plainColor' }}>
                  🗑️ Delete All Data
                </Typography>
                <Typography level="body-sm" sx={{ color: 'danger.plainColor', mb: 3 }}>
                  Permanently delete all application data including operators, treatments, patients, appointments, and invoices. This action cannot be undone.
                </Typography>
                <Button
                  variant="solid"
                  color="danger"
                  startDecorator={<Warning />}
                  onClick={handleDeleteAllData}
                  sx={{ borderRadius: 'sm' }}
                >
                  DELETE ALL DATA
                </Button>
              </Box>

              {/* Important Notice */}
              <Box sx={{ p: 3, backgroundColor: 'warning.softBg', borderRadius: 'sm', border: '1px solid', borderColor: 'warning.outlinedBorder' }}>
                <Typography level="body-sm" sx={{ color: 'warning.plainColor', fontWeight: 'bold', mb: 1 }}>
                  ⚠️ Important Notice
                </Typography>
                <Typography level="body-xs" sx={{ color: 'warning.plainColor' }}>
                  • Create regular backups to prevent data loss
                  • Restoring data will overwrite all existing data
                  • Test restore on a copy before replacing production data
                  • Keep backup files in a secure location
                  • Excel exports are read-only and cannot be imported back into the system
                </Typography>
              </Box>
            </Stack>
          </Card>
        </TabPanel>

        <TabPanel value="logs">
          {/* Activity Logs Card */}
          <Card>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography level="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History />
                  Activity Logs
                  {unreadCount > 0 && (
                    <Badge badgeContent={unreadCount} color="danger" sx={{ ml: 2 }} />
                  )}
                </Typography>
                <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                  View operator actions and system activity history
                </Typography>
              </Box>
              <IconButton
                onClick={markAsRead}
                disabled={unreadCount === 0}
                variant="outlined"
                color="neutral"
              >
                <History />
              </IconButton>
            </Box>

            {logs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <History sx={{ fontSize: 48, color: 'text.tertiary', mb: 2 }} />
                <Typography level="h6" sx={{ color: 'text.tertiary', mb: 1 }}>
                  No activity logs
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                  Operator actions will appear here
                </Typography>
              </Box>
            ) : (
              <List
                sx={{
                  '& .MuiListItem-root': {
                    borderRadius: 'sm',
                    mb: 1,
                    backgroundColor: 'background.level1',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'background.level2'
                    }
                  }
                }}
              >
                {logs.map((log) => (
                  <ListItem key={log.id}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: `${getActionColor(log.action)}.500`,
                        mt: 0.5
                      }}>
                        {getActionIcon(log.action)}
                      </Box>
                      <ListItemContent sx={{ flex: 1 }}>
                        <Box sx={{ mb: 1 }}>
                          <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Person sx={{ fontSize: 14 }} />
                            <strong>{log.operatorName}</strong>
                            <Chip
                              size="sm"
                              variant="soft"
                              color={getActionColor(log.action)}
                              sx={{ fontSize: '10px', px: 1 }}
                            >
                              {log.action.includes('new') || log.action.includes('created') ? 'Created' :
                               log.action.includes('edit') || log.action.includes('updated') ? 'Updated' :
                               log.action.includes('delete') || log.action.includes('removed') ? 'Deleted' : 'Action'}
                            </Chip>
                          </Typography>
                          <Typography level="body-sm" sx={{ lineHeight: 1.4 }}>
                            {formatLogMessage(log)}
                          </Typography>
                        </Box>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarMonth sx={{ fontSize: 12 }} />
                          {formatDate(log.timestamp)}
                        </Typography>
                      </ListItemContent>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Card>
        </TabPanel>
          </Tabs>
      </Box>

      {/* Attribution Footer */}
      <Box sx={{
        mt: 'auto',
        pt: 2,
        textAlign: 'center',
        width: '100%'
      }}>
        <Typography
          level="body-xs"
          sx={{
            color: '#ffffff',
            opacity: 0.7,
            fontSize: '0.75rem'
          }}
        >
          Copyrights © 2025 BSP Center Clinic. Made with ❤︎ in Bekasi
        </Typography>
      </Box>

        {/* Add/Edit Operator Modal */}
      <Modal open={isOperatorModalOpen} onClose={() => setIsOperatorModalOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle sx={{ color: '#ffffff' }}>
            {editingOperator ? 'Edit Operator' : 'Add New Operator'}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleOperatorSubmit}>
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>Operator Name *</FormLabel>
                  <Input
                    value={operatorFormData.name}
                    onChange={handleOperatorInputChange('name')}
                    placeholder="Enter operator name"
                    required
                    sx={{
                      color: '#ffffff',
                      '& input::placeholder': {
                        color: '#ffffff !important',
                        opacity: 0.7
                      },
                      '& input': {
                        color: '#ffffff !important'
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Role *</FormLabel>
                  <Input
                    value={operatorFormData.role}
                    onChange={handleOperatorInputChange('role')}
                    placeholder="Enter role (e.g., Doctor, Nurse, Administrator)"
                    required
                    sx={{
                      color: '#ffffff',
                      '& input::placeholder': {
                        color: '#ffffff !important',
                        opacity: 0.7
                      },
                      '& input': {
                        color: '#ffffff !important'
                      }
                    }}
                  />
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => setIsOperatorModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="solid" color="primary">
                    {editingOperator ? 'Update' : 'Add'} Operator
                  </Button>
                </Box>
              </Stack>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>

      {/* Add/Edit Treatment Modal */}
      <Modal open={isTreatmentModalOpen} onClose={() => setIsTreatmentModalOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle sx={{ color: '#ffffff' }}>
            {editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleTreatmentSubmit}>
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>Treatment Name *</FormLabel>
                  <Input
                    value={treatmentFormData.name}
                    onChange={handleTreatmentInputChange('name')}
                    placeholder="Enter treatment name"
                    required
                    sx={{
                      color: '#ffffff',
                      '& input::placeholder': {
                        color: '#ffffff !important',
                        opacity: 0.7
                      },
                      '& input': {
                        color: '#ffffff !important'
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description *</FormLabel>
                  <Input
                    value={treatmentFormData.description}
                    onChange={handleTreatmentInputChange('description')}
                    placeholder="Enter treatment description"
                    required
                    sx={{
                      color: '#ffffff',
                      '& input::placeholder': {
                        color: '#ffffff !important',
                        opacity: 0.7
                      },
                      '& input': {
                        color: '#ffffff !important'
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Price (IDR) *</FormLabel>
                  <Input
                    type="number"
                    value={treatmentFormData.price}
                    onChange={handleTreatmentInputChange('price')}
                    placeholder="Enter price in IDR"
                    required
                    slotProps={{ input: { min: 0 } }}
                    sx={{
                      color: '#ffffff',
                      '& input::placeholder': {
                        color: '#ffffff !important',
                        opacity: 0.7
                      },
                      '& input': {
                        color: '#ffffff !important'
                      }
                    }}
                  />
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => setIsTreatmentModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="solid" color="primary">
                    {editingTreatment ? 'Update' : 'Add'} Treatment
                  </Button>
                </Box>
              </Stack>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>

      {/* Delete All Data Confirmation Modal */}
      <Modal open={isDeleteAllModalOpen} onClose={() => setIsDeleteAllModalOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle sx={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: 'danger' }} />
            Confirm Permanent Data Deletion
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Alert color="danger" sx={{ mb: 2 }}>
                <Typography level="body-sm" fontWeight="bold">
                  ⚠️ WARNING: This action is irreversible!
                </Typography>
              </Alert>
              <Typography level="body-sm" sx={{ mb: 2 }}>
                You are about to permanently delete ALL application data:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                <Typography component="li" level="body-sm">All operators</Typography>
                <Typography component="li" level="body-sm">All treatments</Typography>
                <Typography component="li" level="body-sm">All patients</Typography>
                <Typography component="li" level="body-sm">All appointments</Typography>
                <Typography component="li" level="body-sm">All invoices</Typography>
              </Box>
              <Typography level="body-sm" sx={{ mb: 3, fontWeight: 'bold' }}>
                This action cannot be undone. All data will be lost forever.
              </Typography>
              <FormControl>
                <FormLabel sx={{ fontWeight: 'bold', mb: 1 }}>
                  Type "DELETE ALL DATA" to confirm:
                </FormLabel>
                <Input
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE ALL DATA"
                  sx={{
                    color: '#ffffff',
                    '& input::placeholder': {
                      color: '#ffffff !important',
                      opacity: 0.7
                    },
                    '& input': {
                      color: '#ffffff !important'
                    }
                  }}
                />
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => setIsDeleteAllModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="danger"
                onClick={confirmDeleteAllData}
                disabled={deleteConfirmationText !== 'DELETE ALL DATA'}
              >
                Permanently Delete All Data
              </Button>
            </Box>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default Settings;
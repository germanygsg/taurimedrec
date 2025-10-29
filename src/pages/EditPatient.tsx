import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import FormLabel from '@mui/joy/FormLabel';
import FormControl from '@mui/joy/FormControl';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
import Alert from '@mui/joy/Alert';
import Stack from '@mui/joy/Stack';
import CircularProgress from '@mui/joy/CircularProgress';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Save from '@mui/icons-material/Save';
import Info from '@mui/icons-material/Info';
import { Patient } from '../types';
import { databaseService } from '../services/database';
import logService from '../services/logService';

const EditPatient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    address: '',
    phone_number: '',
    initial_diagnosis: '',
  });

  useEffect(() => {
    if (id) {
      loadPatient(parseInt(id));
    }
  }, [id]);

  const loadPatient = async (patientId: number) => {
    try {
      setFetching(true);
      const patients = await databaseService.getPatients();
      const foundPatient = patients.find(p => p.id === patientId);

      if (foundPatient) {
        setPatient(foundPatient);
        setFormData({
          name: foundPatient.name,
          age: foundPatient.age.toString(),
          address: foundPatient.address || '',
          phone_number: foundPatient.phone_number,
          initial_diagnosis: foundPatient.initial_diagnosis || '',
        });
      } else {
        setError('Patient not found');
      }
    } catch (error) {
      setError('Failed to load patient details');
      console.error('Error loading patient:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Patient name is required');
      return;
    }

    if (!formData.age || parseInt(formData.age) <= 0) {
      setError('Please enter a valid age');
      return;
    }

    // Phone number is now optional - no validation needed

    if (!patient?.id) {
      setError('Invalid patient ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const patientData: Omit<Patient, 'id' | 'created_at'> = {
        record_number: patient.record_number,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        address: formData.address.trim() || undefined,
        phone_number: formData.phone_number.trim(),
        initial_diagnosis: formData.initial_diagnosis.trim() || undefined,
      };

      await databaseService.updatePatient(patient.id, patientData);

      // Log patient update
      logService.logPatientUpdated(patient.id, patientData.name);

      navigate(`/patients/${patient.id}`);
    } catch (error) {
      setError('Failed to update patient. Please try again.');
      console.error('Error updating patient:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography level="body-lg">Loading patient details...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error && !patient) {
    return (
      <Box sx={{
        maxWidth: '100%',
        mx: 'auto',
        px: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startDecorator={<ArrowBack />}
            onClick={() => navigate('/patients')}
            sx={{ borderRadius: 'sm' }}
          >
            Back to Patients
          </Button>
          <Typography level="h3">Edit Patient</Typography>
        </Box>
        <Alert color="danger" startDecorator={<Info />}>
          {error}
        </Alert>
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startDecorator={<ArrowBack />}
          onClick={() => patient ? navigate(`/patients/${patient.id}`) : navigate('/')}
          sx={{ borderRadius: 'sm' }}
        >
          {patient ? 'Back to Details' : 'Back to Patients'}
        </Button>
        <Typography level="h3">Edit Patient</Typography>
      </Box>

      {error && (
        <Alert color="danger" sx={{ mb: 3 }} startDecorator={<Info />}>
          {error}
        </Alert>
      )}

      {patient && (
        <Card>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3
              }}>
              <FormControl sx={{
                width: { xs: '100%', sm: 'auto' }
              }}>
                  <FormLabel>Record Number</FormLabel>
                  <Input
                    value={patient.record_number}
                    disabled
                    sx={{ width: '150px' }}
                    startDecorator={
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        Cannot be modified
                      </Typography>
                    }
                  />
                </FormControl>
              </Box>

              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 3
              }}>
              <FormControl sx={{
                width: { xs: '100%', lg: '300px' }
              }}>
                  <FormLabel>Patient Name *</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="Enter patient's full name"
                    required
                  />
                </FormControl>

                <FormControl sx={{ width: { xs: '100%', sm: '80px' } }}>
                  <FormLabel>Age *</FormLabel>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange('age')}
                    placeholder="Age"
                    slotProps={{
                      input: {
                        min: 0,
                        max: 150,
                      }
                    }}
                    required
                  />
                </FormControl>
              </Box>

              <FormControl sx={{ width: { xs: '100%', sm: '200px' } }}>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  value={formData.phone_number}
                  onChange={handleInputChange('phone_number')}
                  placeholder="Enter phone number (optional)"
                />
              </FormControl>

              <FormControl sx={{ width: { xs: '100%', sm: '400px' } }}>
                <FormLabel>Address</FormLabel>
                <Input
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  placeholder="Enter address (optional)"
                />
              </FormControl>

              <FormControl sx={{ width: { xs: '100%', sm: '500px' } }}>
                <FormLabel>Initial Diagnosis</FormLabel>
                <Textarea
                  value={formData.initial_diagnosis}
                  onChange={handleInputChange('initial_diagnosis')}
                  placeholder="Enter initial diagnosis (optional)"
                  minRows={3}
                  maxRows={6}
                />
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  startDecorator={<Save />}
                  disabled={loading}
                >
                  Update Patient
                </Button>
              </Box>
            </Stack>
          </form>
        </Card>
      )}
    </Box>
  );
};

export default EditPatient;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ArrowBack from '@mui/icons-material/ArrowBack';
import Save from '@mui/icons-material/Save';
import Info from '@mui/icons-material/Info';
import { Patient } from '../types';
import { databaseService } from '../services/database';
import logService from '../services/logService';

const AddPatient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordNumber, setRecordNumber] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    address: '',
    phone_number: '',
    initial_diagnosis: '',
  });

  useEffect(() => {
    loadRecordNumber();
  }, []);

  const loadRecordNumber = async () => {
    try {
      const number = await databaseService.generateRecordNumber();
      setRecordNumber(number);
    } catch (error) {
      console.error('Error generating record number:', error);
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

    setLoading(true);
    setError(null);

    try {
      const patientData: Omit<Patient, 'id' | 'created_at'> = {
        record_number: recordNumber,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        address: formData.address.trim() || undefined,
        phone_number: formData.phone_number.trim(),
        initial_diagnosis: formData.initial_diagnosis.trim() || undefined,
      };

      const newPatientId = await databaseService.addPatient(patientData);

      // Log patient creation
      logService.logPatientCreated(newPatientId, patientData.name);

      navigate(`/patients/${newPatientId}`);
    } catch (error) {
      setError('Failed to add patient. Please try again.');
      console.error('Error adding patient:', error);
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => navigate('/patients')}
          sx={{ borderRadius: 'sm' }}
        >
          Back to Patients
        </Button>
        <Typography level="h3">Add New Patient</Typography>
      </Box>

      {error && (
        <Alert color="danger" sx={{ mb: 3 }} startDecorator={<Info />}>
          {error}
        </Alert>
      )}

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
                  value={recordNumber}
                  disabled
                  sx={{ width: '150px' }}
                  startDecorator={
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      Auto-generated
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
                  sx={{
                    '& input': {
                      color: '#ffffff !important'
                    },
                    '&::placeholder': {
                      color: '#ffffff !important',
                      opacity: 0.7
                    }
                  }}
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
                  sx={{
                    '& input': {
                      color: '#ffffff !important'
                    },
                    '&::placeholder': {
                      color: '#ffffff !important',
                      opacity: 0.7
                    }
                  }}
                />
              </FormControl>
            </Box>

            <FormControl sx={{ width: { xs: '100%', sm: '200px' } }}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                value={formData.phone_number}
                onChange={handleInputChange('phone_number')}
                placeholder="Enter phone number (optional)"
                sx={{
                  '& input': {
                    color: '#ffffff !important'
                  },
                  '&::placeholder': {
                    color: '#ffffff !important',
                    opacity: 0.7
                  }
                }}
              />
            </FormControl>

            <FormControl sx={{ width: { xs: '100%', sm: '400px' } }}>
              <FormLabel>Address</FormLabel>
              <Input
                value={formData.address}
                onChange={handleInputChange('address')}
                placeholder="Enter address (optional)"
                sx={{
                  '& input': {
                    color: '#ffffff !important'
                  },
                  '&::placeholder': {
                    color: '#ffffff !important',
                    opacity: 0.7
                  }
                }}
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
                sx={{
                  '& textarea': {
                    color: '#ffffff !important'
                  },
                  '&::placeholder': {
                    color: '#ffffff !important',
                    opacity: 0.7
                  }
                }}
              />
            </FormControl>

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'flex-end',
                pt: 2
              }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => navigate('/patients')}
                disabled={loading}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                startDecorator={<Save />}
                disabled={loading}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Save Patient
              </Button>
            </Box>
          </Stack>
        </form>
      </Card>
    </Box>
  );
};

export default AddPatient;
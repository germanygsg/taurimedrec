import React, { useState } from 'react';
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

interface Treatment {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
}

const AddTreatment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const formatPriceInput = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    // Convert to number and format
    if (digits === '') return '';
    const number = parseInt(digits);
    return number.toString();
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPriceInput(event.target.value);
    setFormData(prev => ({
      ...prev,
      price: formattedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Treatment name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.price || parseInt(formData.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get existing treatments from localStorage
      const existingTreatments: Treatment[] = JSON.parse(localStorage.getItem('treatments') || '[]');

      const newTreatment: Treatment = {
        id: Date.now(), // Simple ID generation
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        created_at: new Date().toISOString()
      };

      // Add new treatment to the list
      const updatedTreatments = [...existingTreatments, newTreatment];
      localStorage.setItem('treatments', JSON.stringify(updatedTreatments));

      navigate('/treatments');
    } catch (error) {
      setError('Failed to add treatment. Please try again.');
      console.error('Error adding treatment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPriceDisplay = (value: string) => {
    if (!value) return '';
    const number = parseInt(value);
    return new Intl.NumberFormat('id-ID').format(number);
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
          onClick={() => navigate('/treatments')}
          sx={{ borderRadius: 'sm' }}
        >
          Back to Treatments
        </Button>
        <Typography level="h3">Add New Treatment</Typography>
      </Box>

      {error && (
        <Alert color="danger" sx={{ mb: 3 }} startDecorator={<Info />}>
          {error}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormControl>
              <FormLabel>Treatment Name *</FormLabel>
              <Input
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="Enter treatment name"
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description *</FormLabel>
              <Textarea
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Enter treatment description"
                minRows={3}
                maxRows={6}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Price (IDR) *</FormLabel>
              <Input
                value={formData.price}
                onChange={handlePriceChange}
                placeholder="Enter price in Indonesian Rupiah"
                startDecorator="Rp"
                slotProps={{
                  input: {
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }
                }}
                required
              />
              {formData.price && (
                <Typography level="body-sm" color="neutral" sx={{ mt: 1 }}>
                  Amount: {formatPriceDisplay(formData.price)}
                </Typography>
              )}
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
                onClick={() => navigate('/treatments')}
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
                Save Treatment
              </Button>
            </Box>
          </Stack>
        </form>
      </Card>
    </Box>
  );
};

export default AddTreatment;
import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          height: '100vh',
          overflow: 'auto',
          backgroundColor: 'background.level1',
          p: 0, // Remove all padding from main container
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
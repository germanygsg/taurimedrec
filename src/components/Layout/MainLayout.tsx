import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      width: '100vw', 
      flexDirection: { xs: 'column-reverse', md: 'row' },
      margin: 0,
      padding: 0,
    }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: 'background.level1',
          p: 0,
          m: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingBottom: { xs: '75px', md: 0 }, // Updated to match taller navbar
        }}
      >
        <Box className="status-bar-spacer" />
        <Box
          sx={{
            flex: 1,
            width: '100%',
            minHeight: 0,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            margin: 0,
            padding: 0,
            paddingRight: { xs: '16px', md: 0 },
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </Box>
        <Box className="bottom-nav" />
      </Box>
    </Box>
  );
};

export default MainLayout;
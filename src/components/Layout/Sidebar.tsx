import React from 'react';
import { NavLink } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Menu from '@mui/icons-material/Menu';
import People from '@mui/icons-material/People';
import Dashboard from '@mui/icons-material/Dashboard';
import Settings from '@mui/icons-material/Settings';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Receipt from '@mui/icons-material/Receipt';
import Assessment from '@mui/icons-material/Assessment';
import { useSidebar } from '../../contexts/SidebarContext';

const Sidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <Sheet
      sx={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: isCollapsed ? 60 : 250,
        p: isCollapsed ? 1 : 2,
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.surface',
        transition: 'width 0.2s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          mb: 2,
          flexShrink: 0,
        }}
      >
        <Typography
          level="h4"
          sx={{
            display: isCollapsed ? 'none' : 'block',
            color: '#ffffff',
            fontWeight: 'bold',
          }}
        >
          MedRec
        </Typography>
        <IconButton onClick={toggleSidebar} variant="plain" sx={{ color: '#ffffff' }}>
          <Menu sx={{ color: '#ffffff' }} />
        </IconButton>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List
          sx={{
            '--ListItem-radius': '8px',
            '--ListItem-minHeight': '48px',
          }}
        >
          <ListItem>
            <ListItemButton
              component={NavLink}
              to="/"
              sx={(theme) => ({
                color: '#ffffff',
                '&.active': {
                  backgroundColor: theme.vars.palette.primary.solidBg,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.vars.palette.primary.solidHoverBg,
                  },
                },
              })}
            >
              <Dashboard sx={{ color: '#ffffff' }} />
              <ListItemContent sx={{ ml: 2, display: isCollapsed ? 'none' : 'block', color: '#ffffff' }}>
                Dashboard
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              component={NavLink}
              to="/patients"
              sx={(theme) => ({
                color: '#ffffff',
                '&.active': {
                  backgroundColor: theme.vars.palette.primary.solidBg,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.vars.palette.primary.solidHoverBg,
                  },
                },
              })}
            >
              <People sx={{ color: '#ffffff' }} />
              <ListItemContent sx={{ ml: 2, display: isCollapsed ? 'none' : 'block', color: '#ffffff' }}>
                Patients
              </ListItemContent>
            </ListItemButton>
          </ListItem>
            <ListItem>
            <ListItemButton
              component={NavLink}
              to="/appointments"
              sx={(theme) => ({
                color: '#ffffff',
                '&.active': {
                  backgroundColor: theme.vars.palette.primary.solidBg,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.vars.palette.primary.solidHoverBg,
                  },
                },
              })}
            >
              <CalendarMonth sx={{ color: '#ffffff' }} />
              <ListItemContent sx={{ ml: 2, display: isCollapsed ? 'none' : 'block', color: '#ffffff' }}>
                Appointments
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              component={NavLink}
              to="/invoices"
              sx={(theme) => ({
                color: '#ffffff',
                '&.active': {
                  backgroundColor: theme.vars.palette.primary.solidBg,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.vars.palette.primary.solidHoverBg,
                  },
                },
              })}
            >
              <Receipt sx={{ color: '#ffffff' }} />
              <ListItemContent sx={{ ml: 2, display: isCollapsed ? 'none' : 'block', color: '#ffffff' }}>
                Invoices
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Bottom Navigation - Reports & Settings */}
      <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
        <List
          sx={{
            '--ListItem-radius': '8px',
            '--ListItem-minHeight': '48px',
          }}
        >
          <ListItem>
            <ListItemButton
              component={NavLink}
              to="/reports"
              sx={(theme) => ({
                color: '#ffffff',
                '&.active': {
                  backgroundColor: theme.vars.palette.primary.solidBg,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.vars.palette.primary.solidHoverBg,
                  },
                },
              })}
            >
              <Assessment sx={{ color: '#ffffff' }} />
              <ListItemContent sx={{ ml: 2, display: isCollapsed ? 'none' : 'block', color: '#ffffff' }}>
                Reports
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              component={NavLink}
              to="/settings"
              sx={(theme) => ({
                color: '#ffffff',
                '&.active': {
                  backgroundColor: theme.vars.palette.primary.solidBg,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.vars.palette.primary.solidHoverBg,
                  },
                },
              })}
            >
              <Settings sx={{ color: '#ffffff' }} />
              <ListItemContent sx={{ ml: 2, display: isCollapsed ? 'none' : 'block', color: '#ffffff' }}>
                Settings
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Sheet>
  );
};

export default Sidebar;
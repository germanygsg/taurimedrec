import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import Chip from '@mui/joy/Chip';
import Badge from '@mui/joy/Badge';
import History from '@mui/icons-material/History';
import Person from '@mui/icons-material/Person';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import ArrowBack from '@mui/icons-material/ArrowBack';

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

const ActivityLogsSettings: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
    // Set up an interval to check for new logs
    const interval = setInterval(loadLogs, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = () => {
    if (logs.length > 0) {
      const latestLogId = Math.max(...logs.map(log => log.id));
      localStorage.setItem('logs_last_seen', latestLogId.toString());
      setUnreadCount(0);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('new') || action.includes('created')) return '➕';
    if (action.includes('edit') || action.includes('updated')) return '✏️';
    if (action.includes('delete') || action.includes('removed')) return '🗑️';
    return '📋';
  };

  const getActionColor = (action: string) => {
    if (action.includes('new') || action.includes('created')) return 'success';
    if (action.includes('edit') || action.includes('updated')) return 'warning';
    if (action.includes('delete') || action.includes('removed')) return 'danger';
    return 'neutral';
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography level="body-lg">Loading activity logs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100%',
      p: { xs: 1, md: 2 },
      pt: { xs: 0, md: 2 },
      pr: { xs: 2, md: 2 },
      boxSizing: 'border-box',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startDecorator={<ArrowBack />}
          onClick={() => navigate('/settings')}
          sx={{ borderRadius: 'sm' }}
        >
          Back to Settings
        </Button>
        <Typography level="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History />
          Activity Logs
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="danger" sx={{ ml: 2 }} />
          )}
        </Typography>
      </Box>

      <Card>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography level="h4">System Activity</Typography>
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
                    mt: 0.5,
                    fontSize: '20px'
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
    </Box>
  );
};

export default ActivityLogsSettings;
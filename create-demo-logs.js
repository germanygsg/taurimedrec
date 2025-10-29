// Simple script to create demo activity logs
import fs from 'fs';

// Read existing data
const masterData = JSON.parse(fs.readFileSync('./master.json', 'utf8'));

// Create sample logs based on existing data
const sampleLogs = [
  {
    id: Date.now() - 10000,
    action: "created a new patient record",
    operatorName: "admin",
    targetType: "patient",
    targetId: 1001,
    targetName: "John Doe",
    patientId: 1001,
    patientName: "John Doe",
    timestamp: new Date(Date.now() - 10000).toISOString()
  },
  {
    id: Date.now() - 8000,
    action: "updated patient information",
    operatorName: "ambi",
    targetType: "patient",
    targetId: 1001,
    targetName: "John Doe",
    patientId: 1001,
    patientName: "John Doe",
    timestamp: new Date(Date.now() - 8000).toISOString()
  },
  {
    id: Date.now() - 6000,
    action: "created a new appointment for Jane Smith",
    operatorName: "admin",
    targetType: "appointment",
    targetId: 2001,
    patientId: 1002,
    patientName: "Jane Smith",
    timestamp: new Date(Date.now() - 6000).toISOString()
  },
  {
    id: Date.now() - 4000,
    action: "created an invoice from appointment of Jane Smith",
    operatorName: "ambi",
    targetType: "invoice",
    targetId: 3001,
    targetName: "Appointment 2001",
    patientId: 1002,
    patientName: "Jane Smith",
    timestamp: new Date(Date.now() - 4000).toISOString()
  },
  {
    id: Date.now() - 2000,
    action: "marked invoice as paid for Jane Smith",
    operatorName: "admin",
    targetType: "invoice",
    targetId: 3001,
    patientId: 1002,
    patientName: "Jane Smith",
    timestamp: new Date(Date.now() - 2000).toISOString()
  }
];

console.log('Creating demo activity logs...');
console.log('Sample logs to create:', sampleLogs.length);

// Save to a temporary file that can be imported
fs.writeFileSync('./demo-logs.json', JSON.stringify(sampleLogs, null, 2));
console.log('Demo logs saved to demo-logs.json');
console.log('You can now import this data in the browser console using:');
console.log(`
// Paste this in browser console:
const demoLogs = ${JSON.stringify(sampleLogs, null, 2)};
localStorage.setItem('activity_logs', JSON.stringify(demoLogs));
localStorage.setItem('logs_last_seen', (Math.max(...demoLogs.map(l => l.id)) - 2).toString());
console.log('Demo logs loaded! Refresh the Settings page to see them.');
`);
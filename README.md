# Patient Management System

A modern offline Windows desktop application built with Tauri, React, Vite, and Joy UI for managing patient records with SQLite database.

## Features

- **🏥 Patient Management**: Complete CRUD operations for patient records
- **📋 Smart Patient Cards**: Auto-generated record numbers (PT202500001 format)
- **🔍 Advanced Search**: Real-time search across patient data
- **👁️ Column Visibility**: Customize which columns to display in the patient table
- **📱 Responsive Design**: Modern UI built with Joy UI components
- **💾 Offline Storage**: SQLite database for reliable offline data storage
- **🎯 Clean Interface**: Intuitive navigation sidebar with collapsible menu

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks and TypeScript
- **Vite 7** - Fast build tool and development server
- **Joy UI** - Beautiful, accessible React components
- **React Router** - Client-side routing
- **TypeScript** - Type-safe development

### Backend
- **Tauri 2.0** - Build cross-platform desktop apps with web tech
- **Rust** - Systems programming language for backend
- **SQLite** - Self-contained, serverless database
- **Chrono** - Date and time handling

## Application Structure

```
patient-management-app/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── MainLayout.tsx    # Main app layout with sidebar
│   │       ├── Header.tsx         # Header with breadcrumbs
│   │       └── Sidebar.tsx       # Navigation sidebar
│   ├── contexts/
│   │   └── SidebarContext.tsx    # Sidebar state management
│   ├── pages/
│   │   ├── PatientList.tsx        # Main patient list page
│   │   ├── AddPatient.tsx         # Add new patient form
│   │   ├── PatientDetails.tsx     # View patient details
│   │   └── EditPatient.tsx       # Edit patient form
│   ├── services/
│   │   ├── database.ts            # Tauri API interface
│   │   └── databaseMock.ts        # Mock service for development
│   └── types/
│       └── index.ts               # TypeScript type definitions
├── src-tauri/
│   ├── src/
│   │   └── lib.rs               # Rust backend with SQLite
│   └── Cargo.toml               # Rust dependencies
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Rust and Cargo (for Tauri development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd patient-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Development mode**
   ```bash
   # Start the React development server
   npm run dev

   # Or start the full Tauri app
   npm run tauri:dev
   ```

4. **Production build**
   ```bash
   # Build web version
   npm run build

   # Build desktop application
   npm run tauri:build
   ```

## Patient Record Features

### Patient Information
- **Auto-generated Record Number**: Format PT202500001
- **Basic Info**: Name, Age, Phone Number (required)
- **Optional Fields**: Address, Initial Diagnosis
- **Timestamp**: Automatic creation date tracking

### Table Features
- **Sortable Columns**: Click headers to sort
- **Search Functionality**: Real-time filtering
- **Column Visibility**: Toggle columns via dropdown
- **Action Buttons**: View, Edit, Delete operations

### Navigation
- **Collapsible Sidebar**: Save screen space
- **Breadcrumbs**: Clear navigation path
- **Responsive Design**: Works on all screen sizes

## Development Notes

### Mock Service
The application uses a mock service (`databaseMock.ts`) for development:
- Simulates API responses with realistic delays
- Includes 2 sample patient records
- Maintains data in memory during development session

### Production Mode
The application automatically detects if running in Tauri environment:
- **Web Development**: Uses localStorage mock service (`npm run dev`)
- **Desktop Build**: Uses real SQLite backend (`npm run tauri:dev` or `npm run tauri:build`)

### Building Windows Executable
1. **Install Rust**: https://rustup.rs/
2. **Build the application**:
   ```bash
   npm run tauri:build
   ```
3. **Find your executable**: `src-tauri/target/release/bundle/msi/PatientManagementApp_0.1.0_x64_en-US.msi`

This creates a single `.msi` installer file that users can run to install the app on Windows.

### Database Schema
```sql
CREATE TABLE patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    address TEXT,
    phone_number TEXT NOT NULL,
    initial_diagnosis TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Future Enhancements

- [ ] Patient photo upload
- [ ] Medical history tracking
- [ ] Appointment scheduling
- [ ] Export to PDF/Excel
- [ ] Data backup/restore
- [ ] User authentication
- [ ] Multi-language support

## License

This project is licensed under the MIT License.
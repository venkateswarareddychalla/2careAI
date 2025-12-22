# Digital Health Wallet 🏥

A comprehensive full-stack web application for managing personal health records, tracking vitals, and securely sharing medical reports with family members, doctors, and friends.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)

## ✨ Features

### User Management
- ✅ User registration and login with JWT authentication
- ✅ Secure password hashing using bcrypt
- ✅ Persistent sessions with token-based authentication

### Health Reports Management
- ✅ Upload medical reports (PDF/Images up to 10MB)
- ✅ Drag-and-drop file upload interface
- ✅ Store report metadata (type, date, associated vitals)
- ✅ Download and delete reports
- ✅ Advanced filtering by date range, type, and vitals

### Vitals Tracking
- ✅ Track multiple vital types (Blood Pressure, Heart Rate, Blood Sugar, Temperature)
- ✅ Interactive charts showing trends over time
- ✅ Date range filtering for historical analysis
- ✅ Latest vitals summary dashboard

### Report Sharing & Access Control
- ✅ Share specific reports with doctors, family, or friends
- ✅ Email-based sharing system
- ✅ Role-based access control (Viewer/Editor)
- ✅ Manage and revoke shared access
- ✅ View reports shared with you

### User Interface
- ✅ Beautiful, modern, and responsive design
- ✅ Mobile-first approach (works on all devices)
- ✅ Smooth animations and transitions
- ✅ Gradient backgrounds and glass-morphism effects
- ✅ Intuitive navigation and user experience

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Interactive chart library
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Better-SQLite3** - Fast, synchronous SQLite database
- **bcrypt** - Password hashing
- **JSON Web Tokens (JWT)** - Authentication
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 🏗️ System Architecture

```
┌─────────────────┐
│   React Client  │
│   (Frontend)    │
│   Port: 5173    │
└────────┬────────┘
         │ HTTP/HTTPS
         │ REST API
         ▼
┌─────────────────┐
│  Express Server │
│   (Backend)     │
│   Port: 3000    │
└────────┬────────┘
         │
         ├─────► JWT Authentication (Auth Middleware)
         │
         ├─────► Multer (File Upload Handler)
         │
         ├─────► SQLite Database
         │       ├── users
         │       ├── reports
         │       ├── vitals
         │       └── access_shares
         │
         └─────► Local File Storage (uploads/)
```

### Database Schema

**users**
- id, name, email, password (hashed), created_at

**reports**
- id, user_id, filename, original_name, report_type, report_date, file_type, file_size, created_at

**vitals**
- id, report_id, user_id, vital_type, vital_value, unit, recorded_date, created_at

**access_shares**
- id, report_id, owner_id, shared_with_email, shared_with_name, access_role, created_at

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The backend server will start on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend application will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📚 API Documentation

### Base URL
```
https://twocareai.onrender.com/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
  "token": "jwt_token_here"
}
```

### Reports Endpoints (Requires Authentication)

#### Upload Report
```http
POST /reports/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- file: [PDF or Image file]
- reportType: "Blood Test"
- reportDate: "2024-12-21"
- vitals: JSON string with array of {type, value, unit}

Response: 201 Created
{
  "message": "Report uploaded successfully",
  "reportId": 1,
  "filename": "1703123456-report.pdf"
}
```

#### Get All Reports
```http
GET /reports?reportType=Blood Test&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}

Response: 200 OK
{
  "reports": [...]
}
```

#### Get Single Report
```http
GET /reports/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "report": {...},
  "vitals": [...]
}
```

#### Download Report
```http
GET /reports/:id/download
Authorization: Bearer {token}

Response: File download
```

#### Delete Report
```http
DELETE /reports/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Report deleted successfully"
}
```

### Vitals Endpoints (Requires Authentication)

#### Add Vitals
```http
POST /vitals
Authorization: Bearer {token}
Content-Type: application/json

{
  "reportId": 1,
  "vitals": [
    { "type": "Blood Pressure", "value": "120/80", "unit": "mmHg" },
    { "type": "Heart Rate", "value": "72", "unit": "bpm" }
  ],
  "recordedDate": "2024-12-21"
}

Response: 201 Created
{
  "message": "Vitals added successfully"
}
```

#### Get Vitals Trends
```http
GET /vitals/trends?vitalType=Heart Rate&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}

Response: 200 OK
{
  "trends": {
    "Heart Rate": [
      { "date": "2024-12-20", "value": 72, "unit": "bpm" },
      ...
    ]
  }
}
```

#### Get Vitals Summary
```http
GET /vitals/summary
Authorization: Bearer {token}

Response: 200 OK
{
  "summary": [
    { "vital_type": "Heart Rate", "vital_value": "72", "unit": "bpm", "recorded_date": "2024-12-21" },
    ...
  ]
}
```

### Sharing Endpoints (Requires Authentication)

#### Share Report
```http
POST /shares
Authorization: Bearer {token}
Content-Type: application/json

{
  "reportId": 1,
  "sharedWithEmail": "doctor@example.com",
  "sharedWithName": "Dr. Smith",
  "accessRole": "viewer"
}

Response: 201 Created
{
  "message": "Report shared successfully"
}
```

#### Get Received Shares
```http
GET /shares/received
Authorization: Bearer {token}

Response: 200 OK
{
  "shares": [...]
}
```

#### Get Sent Shares
```http
GET /shares/sent
Authorization: Bearer {token}

Response: 200 OK
{
  "shares": [...]
}
```

#### Revoke Access
```http
DELETE /shares/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Access revoked successfully"
}
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with 7-day token expiration
- Password hashing using bcrypt (10 salt rounds)
- Protected API endpoints requiring valid tokens
- Automatic token validation on protected routes

### Data Security
- SQL injection prevention through prepared statements
- File type validation (only PDF and images allowed)
- File size limit (10MB maximum)
- User-specific data access (users can only see their own data)

### Access Control
- Role-based sharing (viewer/editor roles)
- Email-based sharing system
- Ability to revoke access at any time
- Owner-only delete permissions

### File Storage
- Secure local file storage
- Unique filename generation to prevent conflicts
- Automatic file cleanup on report deletion

## 📁 Project Structure

```
digital-health-wallet/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.routes.js       # Authentication routes
│   │   ├── reports.routes.js    # Report management routes
│   │   ├── vitals.routes.js     # Vitals tracking routes
│   │   └── shares.routes.js     # Sharing routes
│   ├── uploads/                 # Uploaded files storage
│   ├── database.db              # SQLite database file
│   ├── schema.js                # Database schema definition
│   ├── server.js                # Express server setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Main layout with navigation
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── UploadReport.jsx # Report upload page
│   │   │   ├── Reports.jsx      # Reports list
│   │   │   ├── VitalsTracking.jsx # Vitals charts
│   │   │   ├── ShareReport.jsx  # Share management
│   │   │   └── SharedReports.jsx # Shared reports view
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.jsx              # Root component with routing
│   │   ├── index.css            # Global styles
│   │   └── main.jsx             # Entry point
│   └── package.json
│
└── README.md
```

## 🎨 Key Design Features

- **Gradient Mesh Backgrounds**: Beautiful multi-color gradient overlays
- **Glass Morphism**: Semi-transparent elements with backdrop blur
- **Smooth Animations**: Fade-in and slide-in transitions
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Modern Color Palette**: Indigo, pink, and vibrant accent colors
- **Interactive Charts**: Real-time data visualization with Recharts
- **Loading States**: Smooth loading spinners and skeleton screens
- **Error Handling**: User-friendly error messages throughout

## 👨‍💻 Developer

**Venkateswara Reddy Challa**

## 📄 License

This project is created as part of the 2care.ai assignment.

---

**Note**: This is a development setup. For production deployment:
- Use environment variables for sensitive data (JWT secret, database path)
- Switch to a production database (PostgreSQL, MySQL)
- Implement cloud file storage (AWS S3, Google Cloud Storage)
- Add HTTPS encryption
- Implement rate limiting and additional security measures
- Add comprehensive logging and monitoring

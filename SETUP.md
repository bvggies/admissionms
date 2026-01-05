# Setup Guide

## Quick Start

### 1. Install Dependencies

From the root directory:
```bash
npm run install-all
```

Or manually:
```bash
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Database Setup

1. Create a Neon PostgreSQL database at https://neon.tech
2. Copy your connection string
3. Run the SQL schema from `server/config/database.sql` in your Neon SQL editor
4. Create `server/.env` file:
```env
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-secret-key-minimum-32-characters
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 3. Frontend Setup

Create `client/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run the Application

From the root directory:
```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 3000).

Or run separately:
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Default Admin Account

After running the database schema:
- Email: `admin@presbyuniversity.edu.gh`
- Password: `Admin@123`

**IMPORTANT:** Change this password immediately after first login!

## Features Implemented

✅ User Registration & Authentication
✅ Applicant Profile Management
✅ Online Application Submission
✅ AI-Based Admission Evaluation
✅ Admission Officer Review & Approval
✅ Admission Status Notification
✅ Reporting & Analytics
✅ Administration Panel
✅ Professional Logging System
✅ Data Security & Encryption

## Project Structure

```
admissionms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── theme.js        # Material UI theme
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── uploads/           # Uploaded files
│   ├── logs/              # Application logs
│   └── index.js           # Server entry point
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Applicants
- `GET /api/applicants/profile` - Get profile
- `PUT /api/applicants/profile` - Update profile
- `POST /api/applicants/upload-photo` - Upload passport photo
- `POST /api/applicants/upload-document` - Upload document
- `GET /api/applicants/documents` - Get documents

### Applications
- `POST /api/applications/submit` - Submit application
- `GET /api/applications/my-application` - Get applicant's application
- `GET /api/applications` - Get all applications (officer/admin)
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update application status

### Evaluation
- `POST /api/evaluation/:id/evaluate` - Evaluate application
- `POST /api/evaluation/batch-evaluate` - Batch evaluate (admin)

### Officers
- `GET /api/officers/dashboard` - Get dashboard stats

### Admin
- `GET /api/admin/programmes` - Get programmes
- `POST /api/admin/programmes` - Create programme
- `PUT /api/admin/programmes/:id` - Update programme
- `GET /api/admin/users` - Get users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/logs` - Get system logs

### Reports
- `GET /api/reports/statistics` - Get statistics
- `GET /api/reports/export` - Export applications (CSV)

## User Roles

1. **Applicant** - Can register, create profile, submit application, view status
2. **Officer** - Can review applications, evaluate, approve/reject
3. **Admin** - Full access including user management, programme management, logs

## Logging

All system activities are logged:
- Authentication events
- Application submissions
- Status changes
- Admin actions
- Errors

Logs are stored in `server/logs/` with daily rotation.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Data encryption utilities
- File upload validation
- SQL injection protection (parameterized queries)
- CORS configuration

## Troubleshooting

### Port Already in Use
Change the port in `server/.env`:
```
PORT=5001
```

### Database Connection Failed
- Verify DATABASE_URL is correct
- Check if database allows connections
- Ensure SSL is enabled for Neon

### CORS Errors
Update CORS settings in `server/index.js` to include your frontend URL.

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Set up production environment variables
2. Configure email service for notifications
3. Set up SMS service (optional)
4. Configure file storage (S3, Cloudinary, etc.)
5. Set up monitoring and alerts
6. Configure automated backups


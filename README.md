# Admission Management System
## Online AI-Based Admissions System for Presbyterian University College, Ghana

A comprehensive admission management system with AI-based evaluation, built with modern web technologies.

### Tech Stack
- **Frontend**: React (Create React App) with Material UI
- **Backend**: Node.js (Express)
- **Database**: Neon PostgreSQL
- **Hosting**: GitHub, Vercel
- **Logging**: Winston with daily rotation

### Features
✅ User Registration & Authentication (Role-based: Applicant, Officer, Admin)
✅ Applicant Profile Management (Personal info, document upload, validation)
✅ Online Application Submission (Programme selection, academic qualifications, unique ID)
✅ AI-Based Admission Evaluation (Automatic scoring and recommendations)
✅ Admission Officer Review & Approval (Review AI decisions, override with justification)
✅ Admission Status Notification (Email/SMS ready, digital letters)
✅ Reporting & Analytics (Statistics, acceptance rates, CSV export)
✅ Administration Panel (Programme management, user management, audit logs)
✅ Professional Logging System (Winston with daily rotation, audit trails)
✅ Data Security & Encryption (Password hashing, JWT, encryption utilities)

### Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

1. Install dependencies:
```bash
npm run install-all
```

2. Set up database (Neon PostgreSQL) and run schema from `server/config/database.sql`

3. Configure environment variables (see SETUP.md)

4. Run the application:
```bash
npm run dev
```

### Default Admin Account
- Email: `admin@presbyuniversity.edu.gh`
- Password: `Admin@123` (CHANGE IMMEDIATELY!)

### Documentation
- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions

### Project Structure
```
admissionms/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts (Auth)
│   │   ├── pages/      # Page components
│   │   └── theme.js    # Material UI theme
│   └── package.json
├── server/              # Node.js backend
│   ├── config/         # Database config, SQL schema
│   ├── middleware/     # Auth middleware
│   ├── routes/         # API routes
│   ├── utils/          # Utilities (logger, encryption, etc.)
│   ├── uploads/        # Uploaded files
│   └── logs/           # Application logs
└── README.md
```

### API Documentation

See [SETUP.md](./SETUP.md) for complete API endpoint documentation.

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (RBAC)
- Data encryption utilities
- File upload validation
- SQL injection protection
- Professional audit logging

### Logging
All system activities are logged with Winston:
- Authentication events
- Application submissions
- Status changes
- Admin actions
- Errors and security events

Logs are stored in `server/logs/` with daily rotation.

### License
ISC


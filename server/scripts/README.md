# Database Migration Scripts

## Running Migrations

### Using Node.js Script (Recommended)

```bash
cd server
node scripts/migrate.js "your-database-connection-string"
```

Or set DATABASE_URL in .env file:
```bash
node scripts/migrate.js
```

### Using psql (if installed)

```bash
psql "your-database-connection-string" -f server/config/migrate.sql
```

## What Gets Created

### Tables
- `users` - User accounts (applicants, officers, admins)
- `applicants` - Extended applicant information
- `documents` - Uploaded documents
- `programmes` - Academic programmes
- `applications` - Application submissions
- `academic_qualifications` - Academic records
- `admission_requirements` - Programme requirements
- `system_logs` - Audit trail
- `notifications` - User notifications

### Seeded Data
- **Admin User**: admin@presbyuniversity.edu.gh (Password: Admin@123)
- **Officer User**: officer@presbyuniversity.edu.gh (Password: Admin@123)
- **3 Programmes**: Computer Science, Business Administration, Nursing
- **8 Admission Requirements**: Subject requirements for each programme

## Default Accounts

### Admin
- Email: `admin@presbyuniversity.edu.gh`
- Password: `Admin@123`
- Role: `admin`

### Officer
- Email: `officer@presbyuniversity.edu.gh`
- Password: `Admin@123`
- Role: `officer`

**⚠️ IMPORTANT**: Change these passwords immediately after first login!


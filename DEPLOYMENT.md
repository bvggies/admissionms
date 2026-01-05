# Deployment Guide

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database (Neon PostgreSQL recommended)
- GitHub account
- Vercel account

## Setup Instructions

### 1. Database Setup (Neon PostgreSQL)

1. Create an account at [Neon](https://neon.tech)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Run the SQL schema from `server/config/database.sql` in your Neon SQL editor

### 2. Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your values:
```
DATABASE_URL=your-neon-postgresql-connection-string
JWT_SECRET=your-secret-key-change-this
PORT=5000
NODE_ENV=production
LOG_LEVEL=info
ENCRYPTION_KEY=your-encryption-key-32-characters
```

5. Test the server:
```bash
npm start
```

### 3. Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. For production, update `.env` with your backend URL:
```env
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
```

5. Build for production:
```bash
npm run build
```

### 4. Deploy to Vercel

#### Backend Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. In the `server` directory, run:
```bash
vercel
```

3. Follow the prompts to link your project
4. Add environment variables in Vercel dashboard:
   - DATABASE_URL
   - JWT_SECRET
   - ENCRYPTION_KEY
   - NODE_ENV=production

#### Frontend Deployment

1. In the `client` directory, run:
```bash
vercel
```

2. Add environment variable:
   - REACT_APP_API_URL (your backend URL)

### 5. GitHub Setup

1. Initialize git repository:
```bash
git init
```

2. Add all files:
```bash
git add .
```

3. Commit:
```bash
git commit -m "Initial commit"
```

4. Create a repository on GitHub and push:
```bash
git remote add origin https://github.com/yourusername/admissionms.git
git push -u origin main
```

### 6. Continuous Deployment

Vercel will automatically deploy when you push to GitHub. Make sure:
- Backend and frontend are in separate Vercel projects
- Environment variables are set in Vercel dashboard
- Database connection string is correct

## Default Admin Account

After running the database schema, a default admin account is created:
- Email: admin@presbyuniversity.edu.gh
- Password: Admin@123 (CHANGE THIS IMMEDIATELY)

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (at least 32 characters)
- [ ] Use strong ENCRYPTION_KEY (32 characters)
- [ ] Enable HTTPS in production
- [ ] Set up database backups
- [ ] Review and update CORS settings
- [ ] Set up proper file upload limits
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts

## Logging

Logs are stored in `server/logs/` directory:
- `combined-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only
- `info-YYYY-MM-DD.log` - Info logs and above

Logs are automatically rotated daily and kept for:
- Combined/Info: 14 days
- Error: 30 days

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database allows connections from your IP
- Ensure SSL is enabled for Neon PostgreSQL

### CORS Errors
- Update CORS settings in `server/index.js`
- Add your frontend URL to allowed origins

### File Upload Issues
- Check uploads directory exists
- Verify file size limits
- Check file type restrictions

## Support

For issues or questions, please check the logs in `server/logs/` directory.


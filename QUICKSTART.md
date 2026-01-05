# Quick Start Guide

## ✅ Step 1: Database Setup (COMPLETED)
Your Neon database has been migrated and seeded successfully!

## 🔧 Step 2: Configure Environment Variables

### Server Configuration

Create `server/.env` file with the following content:

```env
# Database Connection (already configured)
DATABASE_URL=postgresql://neondb_owner:npg_sx5feEkjDYL7@ep-long-hill-adh7z1ol-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Secret (use the generated one below)
JWT_SECRET=3b3dd34f9bf0381165218900bfd30275a9e2967f78992e141cd55fc2052eef43

# Server Configuration
PORT=5000
NODE_ENV=development

# Logging
LOG_LEVEL=info

# Encryption Key (use the generated one below)
ENCRYPTION_KEY=b3ed0798fbbce93b801751b83daf898d

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### Client Configuration

Create `client/.env` file with:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Step 3: Start the Application

### Option 1: Run Both Together (Recommended)

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend app on http://localhost:3000

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## 🔐 Step 4: Login

### Admin Account
- **URL**: http://localhost:3000/login
- **Email**: `admin@presbyuniversity.edu.gh`
- **Password**: `Admin@123`

### Officer Account
- **Email**: `officer@presbyuniversity.edu.gh`
- **Password**: `Admin@123`

⚠️ **IMPORTANT**: Change these passwords immediately after first login!

## 📋 Step 5: Test the System

1. **As Admin:**
   - Login and change password
   - Go to Admin Dashboard
   - Check Programmes (should see 3 programmes)
   - Check Users (should see 2 users)
   - View System Logs

2. **As Officer:**
   - Login with officer account
   - Go to Officer Dashboard
   - View Applications (empty initially)
   - Check Reports

3. **As Applicant:**
   - Register a new account
   - Complete profile
   - Submit an application
   - Check application status

## 🎯 What You Can Do Now

### For Applicants:
- ✅ Register new account
- ✅ Complete profile
- ✅ Upload documents
- ✅ Submit application
- ✅ View application status

### For Officers:
- ✅ View all applications
- ✅ Run AI evaluation
- ✅ Review and approve/reject applications
- ✅ View dashboard statistics
- ✅ Generate reports

### For Admins:
- ✅ Manage programmes
- ✅ Manage users
- ✅ View system logs
- ✅ Configure admission requirements
- ✅ Access all reports

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 or 3000 is in use:
- Change PORT in `server/.env`
- Update `REACT_APP_API_URL` in `client/.env` accordingly

### Database Connection Error
- Verify DATABASE_URL is correct
- Check if Neon database is active
- Ensure SSL mode is set correctly

### CORS Errors
- Make sure backend is running on port 5000
- Check `REACT_APP_API_URL` matches backend URL

### Module Not Found
```bash
# Reinstall dependencies
cd server && npm install
cd ../client && npm install
```

## 📝 Next Steps

1. **Change Default Passwords** - Immediately after first login
2. **Add More Programmes** - Via Admin panel
3. **Configure Email** - For notifications (optional)
4. **Customize UI** - Update theme colors, branding
5. **Deploy to Production** - See DEPLOYMENT.md

## 🎉 You're All Set!

Your admission management system is ready to use. Start with the admin account to explore all features.


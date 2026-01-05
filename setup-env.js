const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate secure keys
const jwtSecret = crypto.randomBytes(32).toString('hex');
const encryptionKey = crypto.randomBytes(16).toString('hex');

// Server .env content
const serverEnv = `# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_sx5feEkjDYL7@ep-long-hill-adh7z1ol-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Secret (generated - keep this secret!)
JWT_SECRET=${jwtSecret}

# Server Configuration
PORT=5000
NODE_ENV=development

# Logging
LOG_LEVEL=info

# Encryption Key (generated - keep this secret!)
ENCRYPTION_KEY=${encryptionKey}

# Email Configuration (optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
`;

// Client .env content
const clientEnv = `REACT_APP_API_URL=http://localhost:5000/api
`;

// Create server .env
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  fs.writeFileSync(serverEnvPath, serverEnv);
  console.log('✅ Created server/.env');
} else {
  console.log('⚠️  server/.env already exists, skipping...');
}

// Create client .env
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  fs.writeFileSync(clientEnvPath, clientEnv);
  console.log('✅ Created client/.env');
} else {
  console.log('⚠️  client/.env already exists, skipping...');
}

console.log('\n🎉 Environment files created!');
console.log('\n📝 Next steps:');
console.log('1. Review the .env files and update if needed');
console.log('2. Run: npm run dev');
console.log('3. Open http://localhost:3000');
console.log('\n🔐 Default Admin Login:');
console.log('   Email: admin@presbyuniversity.edu.gh');
console.log('   Password: Admin@123');


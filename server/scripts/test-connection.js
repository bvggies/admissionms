require('dotenv').config();
const pool = require('../config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW() as time, current_database() as database');
    console.log('✅ Database connection successful!');
    console.log(`   Database: ${result.rows[0].database}`);
    console.log(`   Server time: ${result.rows[0].time}`);
    
    // Test tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`\n📊 Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Test users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Users in database: ${usersResult.rows[0].count}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. DATABASE_URL in server/.env is correct');
    console.error('2. Neon database is active');
    console.error('3. Network connection is working');
    process.exit(1);
  }
}

testConnection();


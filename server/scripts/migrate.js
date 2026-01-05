const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Please provide DATABASE_URL as environment variable or command line argument');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../config/migrate.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check seeded data
    const usersCount = await client.query('SELECT COUNT(*) as count FROM users');
    const programmesCount = await client.query('SELECT COUNT(*) as count FROM programmes');
    const requirementsCount = await client.query('SELECT COUNT(*) as count FROM admission_requirements');
    
    console.log('\n📦 Seeded data:');
    console.log(`   - Users: ${usersCount.rows[0].count}`);
    console.log(`   - Programmes: ${programmesCount.rows[0].count}`);
    console.log(`   - Admission Requirements: ${requirementsCount.rows[0].count}`);
    
    console.log('\n✅ Database is ready!');
    console.log('\n📝 Default Admin Account:');
    console.log('   Email: admin@presbyuniversity.edu.gh');
    console.log('   Password: Admin@123');
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();


-- Admission Management System Database Schema
-- For Neon PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('applicant', 'officer', 'admin')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applicants table (extends users)
CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    passport_photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programmes table
CREATE TABLE IF NOT EXISTS programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    campus VARCHAR(100),
    duration_years INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id VARCHAR(50) UNIQUE NOT NULL,
    applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
    programme_id UUID REFERENCES programmes(id),
    campus VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'admitted', 'waitlisted', 'rejected', 'withdrawn')),
    ai_score DECIMAL(5,2),
    ai_recommendation VARCHAR(50),
    ai_explanation TEXT,
    officer_decision VARCHAR(50),
    officer_notes TEXT,
    officer_id UUID REFERENCES users(id),
    decision_date TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Academic qualifications table
CREATE TABLE IF NOT EXISTS academic_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    qualification_type VARCHAR(100) NOT NULL,
    institution_name VARCHAR(255),
    year_completed INTEGER,
    subjects JSONB,
    overall_grade VARCHAR(50),
    certificate_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admission requirements table
CREATE TABLE IF NOT EXISTS admission_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    minimum_grade VARCHAR(10) NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System logs table (for audit trail)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_programme_id ON applications(programme_id);
CREATE INDEX IF NOT EXISTS idx_applications_application_id ON applications(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_applicant_id ON documents(applicant_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Insert default admin user (password: Admin@123 - should be changed in production)
-- Password hash for 'Admin@123' using bcrypt (generated hash)
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active, email_verified)
VALUES ('admin@presbyuniversity.edu.gh', '$2b$10$qS9VEEUWey0l8oLl.T0.lu98W7o8UoxL18B1p8S8a1L2xzsg8LKnK', 'admin', 'System', 'Administrator', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample programmes
INSERT INTO programmes (code, name, campus, duration_years, description) VALUES
('CS001', 'Computer Science', 'Akuapem Campus', 4, 'Bachelor of Science in Computer Science'),
('BA001', 'Business Administration', 'Akuapem Campus', 4, 'Bachelor of Business Administration'),
('NS001', 'Nursing', 'Agogo Campus', 4, 'Bachelor of Science in Nursing')
ON CONFLICT (code) DO NOTHING;


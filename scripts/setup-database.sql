-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Perusahaan', 'CV', 'Perorangan')),
  npwp VARCHAR(20) UNIQUE NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  services TEXT[], -- Array of services
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  status VARCHAR(50) DEFAULT 'Final' CHECK (status IN ('Final', 'Draft', 'Review')),
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  description TEXT,
  consultation_date TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  type VARCHAR(50) CHECK (type IN ('Meeting', 'Video Call', 'Phone Call')),
  status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  consultant VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spt_records table for dashboard metrics
CREATE TABLE IF NOT EXISTS spt_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  period VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved')),
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for clients
INSERT INTO clients (name, type, npwp, contact_person, phone, email, address, status, services) VALUES
('PT Teknologi Maju', 'Perusahaan', '01.234.567.8-901.000', 'Budi Santoso', '+62 21 1234567', 'budi@teknologimaju.com', 'Jakarta Selatan', 'Aktif', ARRAY['PPh Badan', 'PPN', 'PPh 21']),
('CV Berkah Jaya', 'CV', '02.345.678.9-012.000', 'Siti Rahayu', '+62 21 2345678', 'siti@berkahjaya.com', 'Jakarta Timur', 'Aktif', ARRAY['PPh Final', 'PPN']),
('Ahmad Wijaya', 'Perorangan', '03.456.789.0-123.000', 'Ahmad Wijaya', '+62 812 3456789', 'ahmad.wijaya@email.com', 'Depok', 'Aktif', ARRAY['PPh OP']),
('PT Digital Nusantara', 'Perusahaan', '04.567.890.1-234.000', 'Maria Gonzalez', '+62 21 3456789', 'maria@digitalnusantara.com', 'Jakarta Pusat', 'Tidak Aktif', ARRAY['PPh Badan', 'PPN', 'PPh 21', 'PPh 23']);

-- Insert sample SPT records for dashboard
INSERT INTO spt_records (client_id, type, period, amount, status, created_by) 
SELECT 
  c.id,
  (ARRAY['PPh 21', 'PPh 23', 'PPN', 'PPh Badan'])[floor(random() * 4 + 1)],
  (ARRAY['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'])[floor(random() * 6 + 1)],
  (random() * 5000000 + 500000)::DECIMAL(15,2),
  (ARRAY['Draft', 'Submitted', 'Approved'])[floor(random() * 3 + 1)],
  (ARRAY['Ahmad Wijaya', 'Siti Rahayu', 'Budi Santoso'])[floor(random() * 3 + 1)]
FROM clients c, generate_series(1, 3);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spt_records_updated_at BEFORE UPDATE ON spt_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

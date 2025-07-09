-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Dalam Proses' CHECK (status IN ('Dalam Proses', 'Menunggu Review', 'Selesai')),
  priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  assignee VARCHAR(255),
  due_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spt_forms table
CREATE TABLE IF NOT EXISTS spt_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  period VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Dalam Proses' CHECK (status IN ('Dalam Proses', 'Review', 'Selesai')),
  amount DECIMAL(15,2),
  due_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Selesai', 'Dibatalkan')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER, -- in minutes
  location VARCHAR(255),
  reminder_minutes INTEGER DEFAULT 15,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample workflows
INSERT INTO workflows (client_id, title, description, category, status, priority, assignee, due_date, progress, created_by)
SELECT 
  c.id,
  (ARRAY['SPT PPh 21 Processing', 'PPN Calculation Review', 'Tax Audit Preparation', 'Client Onboarding'])[floor(random() * 4 + 1)],
  'Workflow description for ' || c.name,
  (ARRAY['SPT Masa', 'Audit', 'Onboarding', 'Review'])[floor(random() * 4 + 1)],
  (ARRAY['Dalam Proses', 'Menunggu Review', 'Selesai'])[floor(random() * 3 + 1)],
  (ARRAY['Low', 'Medium', 'High'])[floor(random() * 3 + 1)],
  (ARRAY['Ahmad Wijaya', 'Siti Rahayu', 'Budi Santoso'])[floor(random() * 3 + 1)],
  NOW() + INTERVAL '7 days' * random(),
  floor(random() * 100),
  (ARRAY['Ahmad Wijaya', 'Siti Rahayu', 'Budi Santoso'])[floor(random() * 3 + 1)]
FROM clients c;

-- Insert sample SPT forms
INSERT INTO spt_forms (client_id, title, type, period, status, amount, due_date, progress, created_by)
SELECT 
  c.id,
  'SPT ' || (ARRAY['PPh 21', 'PPh 23', 'PPN', 'PPh Badan'])[floor(random() * 4 + 1)] || ' - ' || c.name,
  (ARRAY['PPh 21', 'PPh 23', 'PPN', 'PPh Badan'])[floor(random() * 4 + 1)],
  (ARRAY['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07'])[floor(random() * 7 + 1)],
  (ARRAY['Dalam Proses', 'Review', 'Selesai'])[floor(random() * 3 + 1)],
  (random() * 5000000 + 500000)::DECIMAL(15,2),
  NOW() + INTERVAL '15 days' * random(),
  floor(random() * 100),
  (ARRAY['Ahmad Wijaya', 'Siti Rahayu', 'Budi Santoso'])[floor(random() * 3 + 1)]
FROM clients c;

-- Insert sample schedules
INSERT INTO schedules (client_id, title, description, type, status, scheduled_date, duration, location, reminder_minutes, created_by)
SELECT 
  c.id,
  (ARRAY['Konsultasi Pajak', 'Review Dokumen', 'Meeting SPT', 'Audit Preparation'])[floor(random() * 4 + 1)] || ' - ' || c.name,
  'Scheduled meeting with ' || c.name,
  (ARRAY['Meeting', 'Konsultasi', 'Review', 'Audit'])[floor(random() * 4 + 1)],
  (ARRAY['Pending', 'Selesai'])[floor(random() * 2 + 1)],
  NOW() + INTERVAL '1 day' * floor(random() * 30),
  (ARRAY[30, 60, 90, 120])[floor(random() * 4 + 1)],
  (ARRAY['Office', 'Client Location', 'Video Call', 'Phone Call'])[floor(random() * 4 + 1)],
  (ARRAY[15, 30, 60])[floor(random() * 3 + 1)],
  (ARRAY['Ahmad Wijaya', 'Siti Rahayu', 'Budi Santoso'])[floor(random() * 3 + 1)]
FROM clients c, generate_series(1, 2);

-- Create triggers for updated_at
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spt_forms_updated_at BEFORE UPDATE ON spt_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

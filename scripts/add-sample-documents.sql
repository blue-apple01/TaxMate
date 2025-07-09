-- Insert sample documents (assuming we have client IDs from previous script)
INSERT INTO documents (name, client_id, type, category, file_path, file_size, status, uploaded_by) 
SELECT 
  'SPT Masa PPh 21 - Juni 2025.pdf',
  c.id,
  'SPT Masa',
  'PPh 21',
  'sample-spt-pph21.pdf',
  2400000,
  'Final',
  'Ahmad Wijaya'
FROM clients c WHERE c.name = 'PT Teknologi Maju' LIMIT 1;

INSERT INTO documents (name, client_id, type, category, file_path, file_size, status, uploaded_by) 
SELECT 
  'Bukti Potong PPh 23 - CV Berkah.pdf',
  c.id,
  'Bukti Potong',
  'PPh 23',
  'sample-bukti-potong.pdf',
  1800000,
  'Draft',
  'Siti Rahayu'
FROM clients c WHERE c.name = 'CV Berkah Jaya' LIMIT 1;

INSERT INTO documents (name, client_id, type, category, file_path, file_size, status, uploaded_by) 
SELECT 
  'Faktur Pajak Masukan - Juni.xlsx',
  c.id,
  'Faktur Pajak',
  'PPN',
  'sample-faktur-pajak.xlsx',
  856000,
  'Review',
  'Budi Santoso'
FROM clients c WHERE c.name = 'PT Digital Nusantara' LIMIT 1;

INSERT INTO documents (name, client_id, type, category, file_path, file_size, status, uploaded_by) 
SELECT 
  'Laporan Keuangan Q2 2025.pdf',
  c.id,
  'Laporan Keuangan',
  'Supporting',
  'sample-laporan-keuangan.pdf',
  3200000,
  'Final',
  'Maria Gonzalez'
FROM clients c WHERE c.name = 'Ahmad Wijaya' LIMIT 1;

INSERT INTO documents (name, client_id, type, category, file_path, file_size, status, uploaded_by) 
SELECT 
  'NPWP Scan.jpg',
  c.id,
  'Dokumen Legal',
  'Identitas',
  'sample-npwp-scan.jpg',
  1200000,
  'Final',
  'Ahmad Wijaya'
FROM clients c WHERE c.name = 'PT Teknologi Maju' LIMIT 1;

-- Insert sample consultations
INSERT INTO consultations (client_id, topic, description, consultation_date, duration, type, status, consultant)
SELECT 
  c.id,
  'Konsultasi PPh 21 Karyawan Asing',
  'Membutuhkan konsultasi mengenai perhitungan PPh 21 untuk karyawan asing yang baru bergabung.',
  '2025-07-10 14:00:00',
  120,
  'Video Call',
  'Scheduled',
  'Ahmad Wijaya'
FROM clients c WHERE c.name = 'PT Teknologi Maju' LIMIT 1;

INSERT INTO consultations (client_id, topic, description, consultation_date, duration, type, status, consultant)
SELECT 
  c.id,
  'Review SPT Masa PPN',
  'Review dan validasi SPT Masa PPN sebelum submit ke DJP.',
  '2025-07-09 10:00:00',
  60,
  'Meeting',
  'Scheduled',
  'Siti Rahayu'
FROM clients c WHERE c.name = 'CV Berkah Jaya' LIMIT 1;

INSERT INTO consultations (client_id, topic, description, consultation_date, duration, type, status, consultant)
SELECT 
  c.id,
  'Perencanaan Pajak 2025',
  'Diskusi strategi perencanaan pajak untuk tahun 2025.',
  '2025-07-06 16:00:00',
  90,
  'Phone Call',
  'Completed',
  'Ahmad Wijaya'
FROM clients c WHERE c.name = 'Ahmad Wijaya' LIMIT 1;

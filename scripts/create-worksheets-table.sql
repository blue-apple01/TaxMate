-- Create worksheets table
CREATE TABLE IF NOT EXISTS public.worksheets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PPh 21', 'PPh 23', 'PPN', 'PPh Badan', 'PPh Final UMKM')),
    period TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Dalam Proses', 'Menunggu Review', 'Selesai')),
    assignee TEXT,
    amount DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_worksheets_client_id ON public.worksheets(client_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_type ON public.worksheets(type);
CREATE INDEX IF NOT EXISTS idx_worksheets_status ON public.worksheets(status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on worksheets" ON public.worksheets
    FOR ALL USING (true);

-- Insert sample data
INSERT INTO public.worksheets (client_name, type, period, status, assignee, amount, notes) VALUES
('PT Teknologi Maju', 'PPh 21', 'Juni 2025', 'Selesai', 'Ahmad Wijaya', 15000000, 'Perhitungan gaji karyawan bulan Juni'),
('CV Berkah Jaya', 'PPN', 'Juni 2025', 'Dalam Proses', 'Siti Rahayu', 8500000, 'PPN untuk transaksi penjualan'),
('PT Digital Nusantara', 'PPh 23', 'Juni 2025', 'Menunggu Review', 'Budi Santoso', 3200000, 'Pajak jasa konsultasi IT'),
('Ahmad Wijaya', 'PPh Final UMKM', '2024', 'Draft', 'Maria Gonzalez', 1200000, 'PPh Final berdasarkan PP 23/2018'),
('PT Maju Bersama', 'PPh Badan', 'Q2 2025', 'Dalam Proses', 'Ahmad Wijaya', 25000000, 'Pajak penghasilan badan kuartal 2'),
('CV Sukses Mandiri', 'PPh 21', 'Mei 2025', 'Selesai', 'Siti Rahayu', 12000000, 'Gaji karyawan bulan Mei'),
('PT Inovasi Digital', 'PPN', 'Mei 2025', 'Menunggu Review', 'Budi Santoso', 18000000, 'PPN transaksi software'),
('Toko Sari Rasa', 'PPh Final UMKM', 'Q2 2025', 'Draft', 'Maria Gonzalez', 800000, 'UMKM bidang kuliner');

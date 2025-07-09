import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          type: "Perusahaan" | "CV" | "Perorangan"
          npwp: string
          contact_person: string
          phone: string | null
          email: string | null
          address: string | null
          status: "Aktif" | "Tidak Aktif"
          services: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: "Perusahaan" | "CV" | "Perorangan"
          npwp: string
          contact_person: string
          phone?: string | null
          email?: string | null
          address?: string | null
          status?: "Aktif" | "Tidak Aktif"
          services?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: "Perusahaan" | "CV" | "Perorangan"
          npwp?: string
          contact_person?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          status?: "Aktif" | "Tidak Aktif"
          services?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      worksheets: {
        Row: {
          id: string
          client_id: string | null
          client_name: string
          type: "PPh 21" | "PPh 23" | "PPN" | "PPh Badan" | "PPh Final UMKM"
          period: string
          status: "Draft" | "Dalam Proses" | "Menunggu Review" | "Selesai"
          assignee: string | null
          amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          client_name: string
          type: "PPh 21" | "PPh 23" | "PPN" | "PPh Badan" | "PPh Final UMKM"
          period: string
          status?: "Draft" | "Dalam Proses" | "Menunggu Review" | "Selesai"
          assignee?: string | null
          amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          client_name?: string
          type?: "PPh 21" | "PPh 23" | "PPN" | "PPh Badan" | "PPh Final UMKM"
          period?: string
          status?: "Draft" | "Dalam Proses" | "Menunggu Review" | "Selesai"
          assignee?: string | null
          amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          client_id: string
          type: string
          category: string
          file_path: string
          file_size: number | null
          status: "Final" | "Draft" | "Review"
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          client_id: string
          type: string
          category: string
          file_path: string
          file_size?: number | null
          status?: "Final" | "Draft" | "Review"
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          client_id?: string
          type?: string
          category?: string
          file_path?: string
          file_size?: number | null
          status?: "Final" | "Draft" | "Review"
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          client_id: string
          topic: string
          description: string | null
          consultation_date: string | null
          duration: number | null
          type: "Meeting" | "Video Call" | "Phone Call" | null
          status: "Scheduled" | "Completed" | "Cancelled"
          consultant: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          topic: string
          description?: string | null
          consultation_date?: string | null
          duration?: number | null
          type?: "Meeting" | "Video Call" | "Phone Call" | null
          status?: "Scheduled" | "Completed" | "Cancelled"
          consultant?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          topic?: string
          description?: string | null
          consultation_date?: string | null
          duration?: number | null
          type?: "Meeting" | "Video Call" | "Phone Call" | null
          status?: "Scheduled" | "Completed" | "Cancelled"
          consultant?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      spt_records: {
        Row: {
          id: string
          client_id: string
          type: string
          period: string
          amount: number | null
          status: "Draft" | "Submitted" | "Approved"
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          type: string
          period: string
          amount?: number | null
          status?: "Draft" | "Submitted" | "Approved"
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          type?: string
          period?: string
          amount?: number | null
          status?: "Draft" | "Submitted" | "Approved"
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          category: string
          status: "Dalam Proses" | "Menunggu Review" | "Selesai"
          priority: "Low" | "Medium" | "High"
          assignee: string | null
          due_date: string | null
          progress: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          category: string
          status?: "Dalam Proses" | "Menunggu Review" | "Selesai"
          priority?: "Low" | "Medium" | "High"
          assignee?: string | null
          due_date?: string | null
          progress?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string | null
          category?: string
          status?: "Dalam Proses" | "Menunggu Review" | "Selesai"
          priority?: "Low" | "Medium" | "High"
          assignee?: string | null
          due_date?: string | null
          progress?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      spt_forms: {
        Row: {
          id: string
          client_id: string
          title: string
          type: string
          period: string
          status: "Dalam Proses" | "Review" | "Selesai"
          amount: number | null
          due_date: string | null
          progress: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          type: string
          period: string
          status?: "Dalam Proses" | "Review" | "Selesai"
          amount?: number | null
          due_date?: string | null
          progress?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          type?: string
          period?: string
          status?: "Dalam Proses" | "Review" | "Selesai"
          amount?: number | null
          due_date?: string | null
          progress?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          type: string
          status: "Pending" | "Selesai" | "Dibatalkan"
          scheduled_date: string
          duration: number | null
          location: string | null
          reminder_minutes: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          type: string
          status?: "Pending" | "Selesai" | "Dibatalkan"
          scheduled_date: string
          duration?: number | null
          location?: string | null
          reminder_minutes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string | null
          type?: string
          status?: "Pending" | "Selesai" | "Dibatalkan"
          scheduled_date?: string
          duration?: number | null
          location?: string | null
          reminder_minutes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

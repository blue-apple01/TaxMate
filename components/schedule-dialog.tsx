"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
}

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: any
  onSuccess: () => void
  selectedDate?: Date
}

export function ScheduleDialog({ open, onOpenChange, schedule, onSuccess, selectedDate }: ScheduleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    description: "",
    type: "",
    status: "Pending" as const,
    scheduled_date: "",
    scheduled_time: "",
    duration: 60,
    location: "",
    reminder_minutes: 15,
  })

  useEffect(() => {
    if (open) {
      fetchClients()
      if (schedule) {
        const scheduledDate = new Date(schedule.scheduled_date)
        setFormData({
          client_id: schedule.client_id,
          title: schedule.title,
          description: schedule.description || "",
          type: schedule.type,
          status: schedule.status,
          scheduled_date: scheduledDate.toISOString().split("T")[0],
          scheduled_time: scheduledDate.toTimeString().slice(0, 5),
          duration: schedule.duration || 60,
          location: schedule.location || "",
          reminder_minutes: schedule.reminder_minutes,
        })
      } else {
        const defaultDate = selectedDate || new Date()
        setFormData({
          client_id: "",
          title: "",
          description: "",
          type: "",
          status: "Pending",
          scheduled_date: defaultDate.toISOString().split("T")[0],
          scheduled_time: "09:00",
          duration: 60,
          location: "",
          reminder_minutes: 15,
        })
      }
    }
  }, [open, schedule, selectedDate])

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("id, name").eq("status", "Aktif")
    if (data) setClients(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`)

      const submitData = {
        client_id: formData.client_id,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        scheduled_date: scheduledDateTime.toISOString(),
        duration: formData.duration,
        location: formData.location,
        reminder_minutes: formData.reminder_minutes,
        created_by: "Current User", // Replace with actual user
      }

      if (schedule) {
        const { error } = await supabase.from("schedules").update(submitData).eq("id", schedule.id)

        if (error) throw error
        toast({ title: "Jadwal berhasil diperbarui" })
      } else {
        const { error } = await supabase.from("schedules").insert([submitData])

        if (error) throw error
        toast({ title: "Jadwal berhasil dibuat" })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{schedule ? "Edit Jadwal" : "Tambah Jadwal Baru"}</DialogTitle>
          <DialogDescription>{schedule ? "Edit informasi jadwal" : "Buat jadwal baru untuk klien"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Klien</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih klien" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Jenis Jadwal</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Konsultasi">Konsultasi</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Audit">Audit</SelectItem>
                  <SelectItem value="Presentasi">Presentasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Jadwal</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masukkan judul jadwal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi jadwal"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Tanggal</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Waktu</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durasi (menit)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 60 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office">Kantor</SelectItem>
                  <SelectItem value="Client Location">Lokasi Klien</SelectItem>
                  <SelectItem value="Video Call">Video Call</SelectItem>
                  <SelectItem value="Phone Call">Telepon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_minutes">Reminder (menit sebelum)</Label>
              <Select
                value={formData.reminder_minutes.toString()}
                onValueChange={(value) => setFormData({ ...formData, reminder_minutes: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 menit</SelectItem>
                  <SelectItem value="30">30 menit</SelectItem>
                  <SelectItem value="60">1 jam</SelectItem>
                  <SelectItem value="120">2 jam</SelectItem>
                  <SelectItem value="1440">1 hari</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
                <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : schedule ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

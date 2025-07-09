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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
}

interface SPTDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  spt?: any
  onSuccess: () => void
}

export function SPTDialog({ open, onOpenChange, spt, onSuccess }: SPTDialogProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    type: "",
    period: "",
    status: "Dalam Proses" as const,
    amount: "",
    due_date: "",
    progress: 0,
  })

  useEffect(() => {
    if (open) {
      fetchClients()
      if (spt) {
        setFormData({
          client_id: spt.client_id,
          title: spt.title,
          type: spt.type,
          period: spt.period,
          status: spt.status,
          amount: spt.amount?.toString() || "",
          due_date: spt.due_date ? new Date(spt.due_date).toISOString().split("T")[0] : "",
          progress: spt.progress,
        })
      } else {
        setFormData({
          client_id: "",
          title: "",
          type: "",
          period: "",
          status: "Dalam Proses",
          amount: "",
          due_date: "",
          progress: 0,
        })
      }
    }
  }, [open, spt])

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("id, name").eq("status", "Aktif")
    if (data) setClients(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        amount: formData.amount ? Number.parseFloat(formData.amount) : null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        created_by: "Current User", // Replace with actual user
      }

      if (spt) {
        const { error } = await supabase.from("spt_forms").update(submitData).eq("id", spt.id)

        if (error) throw error
        toast({ title: "SPT berhasil diperbarui" })
      } else {
        const { error } = await supabase.from("spt_forms").insert([submitData])

        if (error) throw error
        toast({ title: "SPT berhasil dibuat" })
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
          <DialogTitle>{spt ? "Edit SPT" : "Buat SPT Baru"}</DialogTitle>
          <DialogDescription>{spt ? "Edit informasi SPT" : "Buat SPT baru untuk klien"}</DialogDescription>
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
              <Label htmlFor="type">Jenis SPT</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis SPT" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PPh 21">PPh 21</SelectItem>
                  <SelectItem value="PPh 23">PPh 23</SelectItem>
                  <SelectItem value="PPN">PPN</SelectItem>
                  <SelectItem value="PPh Badan">PPh Badan</SelectItem>
                  <SelectItem value="PPh OP">PPh OP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul SPT</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masukkan judul SPT"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">Periode</Label>
              <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-01">Januari 2025</SelectItem>
                  <SelectItem value="2025-02">Februari 2025</SelectItem>
                  <SelectItem value="2025-03">Maret 2025</SelectItem>
                  <SelectItem value="2025-04">April 2025</SelectItem>
                  <SelectItem value="2025-05">Mei 2025</SelectItem>
                  <SelectItem value="2025-06">Juni 2025</SelectItem>
                  <SelectItem value="2025-07">Juli 2025</SelectItem>
                  <SelectItem value="2024">Tahun 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Pajak (Rp)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Number.parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Tanggal Deadline</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : spt ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

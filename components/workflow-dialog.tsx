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

interface WorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow?: any
  onSuccess: () => void
}

export function WorkflowDialog({ open, onOpenChange, workflow, onSuccess }: WorkflowDialogProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    description: "",
    category: "",
    status: "Dalam Proses" as const,
    priority: "Medium" as const,
    assignee: "",
    due_date: "",
    progress: 0,
  })

  useEffect(() => {
    if (open) {
      fetchClients()
      if (workflow) {
        setFormData({
          client_id: workflow.client_id,
          title: workflow.title,
          description: workflow.description || "",
          category: workflow.category,
          status: workflow.status,
          priority: workflow.priority,
          assignee: workflow.assignee || "",
          due_date: workflow.due_date ? new Date(workflow.due_date).toISOString().split("T")[0] : "",
          progress: workflow.progress,
        })
      } else {
        setFormData({
          client_id: "",
          title: "",
          description: "",
          category: "",
          status: "Dalam Proses",
          priority: "Medium",
          assignee: "",
          due_date: "",
          progress: 0,
        })
      }
    }
  }, [open, workflow])

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
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        created_by: "Current User", // Replace with actual user
      }

      if (workflow) {
        const { error } = await supabase.from("workflows").update(submitData).eq("id", workflow.id)

        if (error) throw error
        toast({ title: "Workflow berhasil diperbarui" })
      } else {
        const { error } = await supabase.from("workflows").insert([submitData])

        if (error) throw error
        toast({ title: "Workflow berhasil dibuat" })
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
          <DialogTitle>{workflow ? "Edit Workflow" : "Tambah Workflow Baru"}</DialogTitle>
          <DialogDescription>
            {workflow ? "Edit informasi workflow" : "Buat workflow baru untuk klien"}
          </DialogDescription>
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
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPT Masa">SPT Masa</SelectItem>
                  <SelectItem value="Audit">Audit</SelectItem>
                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Konsultasi">Konsultasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Workflow</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masukkan judul workflow"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi workflow"
              rows={3}
            />
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
                  <SelectItem value="Menunggu Review">Menunggu Review</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioritas</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Rendah</SelectItem>
                  <SelectItem value="Medium">Sedang</SelectItem>
                  <SelectItem value="High">Tinggi</SelectItem>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={formData.assignee}
                onValueChange={(value) => setFormData({ ...formData, assignee: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ahmad Wijaya">Ahmad Wijaya</SelectItem>
                  <SelectItem value="Siti Rahayu">Siti Rahayu</SelectItem>
                  <SelectItem value="Budi Santoso">Budi Santoso</SelectItem>
                </SelectContent>
              </Select>
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
              {loading ? "Menyimpan..." : workflow ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

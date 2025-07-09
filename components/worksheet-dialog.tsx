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
import { Textarea } from "@/components/ui/textarea"
import { supabase, type Database } from "@/lib/supabase"
import { toast } from "sonner"

type Worksheet = Database["public"]["Tables"]["worksheets"]["Row"]
type WorksheetInsert = Database["public"]["Tables"]["worksheets"]["Insert"]
type WorksheetUpdate = Database["public"]["Tables"]["worksheets"]["Update"]

interface WorksheetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  worksheet?: Worksheet | null
  onSuccess: () => void
}

const worksheetTypes = ["PPh 21", "PPh 23", "PPN", "PPh Badan", "PPh Final UMKM"] as const

const statusOptions = ["Draft", "Dalam Proses", "Menunggu Review", "Selesai"] as const

export function WorksheetDialog({ open, onOpenChange, worksheet, onSuccess }: WorksheetDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<WorksheetInsert>({
    client_name: "",
    type: "PPh 21",
    period: "",
    status: "Draft",
    assignee: "",
    amount: null,
    notes: "",
  })

  const isEditing = !!worksheet

  useEffect(() => {
    if (worksheet) {
      setFormData({
        client_name: worksheet.client_name,
        type: worksheet.type,
        period: worksheet.period,
        status: worksheet.status,
        assignee: worksheet.assignee || "",
        amount: worksheet.amount,
        notes: worksheet.notes || "",
      })
    } else {
      setFormData({
        client_name: "",
        type: "PPh 21",
        period: "",
        status: "Draft",
        assignee: "",
        amount: null,
        notes: "",
      })
    }
  }, [worksheet])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        const updateData: WorksheetUpdate = {
          ...formData,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from("worksheets").update(updateData).eq("id", worksheet.id)

        if (error) throw error
        toast.success("Lembar kerja berhasil diperbarui")
      } else {
        const { error } = await supabase.from("worksheets").insert([formData])

        if (error) throw error
        toast.success("Lembar kerja berhasil dibuat")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving worksheet:", error)
      toast.error("Gagal menyimpan lembar kerja")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof WorksheetInsert, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Lembar Kerja" : "Buat Lembar Kerja Baru"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Perbarui informasi lembar kerja" : "Buat lembar kerja pajak baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Nama Klien</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => handleInputChange("client_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Jenis Pajak</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {worksheetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">Periode</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => handleInputChange("period", e.target.value)}
                placeholder="contoh: Juni 2025"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Penanggung Jawab</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleInputChange("assignee", e.target.value)}
                placeholder="Nama penanggung jawab"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) => handleInputChange("amount", e.target.value ? Number.parseFloat(e.target.value) : null)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Catatan tambahan..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : isEditing ? "Perbarui" : "Buat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

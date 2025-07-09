"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { fetchClients } from "@/lib/client-utils"
import type { Database } from "@/lib/supabase"

type Client = Database["public"]["Tables"]["clients"]["Row"]
type Document = Database["public"]["Tables"]["documents"]["Row"]

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: Document | null
  onSuccess: () => void
}

const documentTypes = [
  "SPT Masa",
  "SPT Tahunan",
  "Bukti Potong",
  "Faktur Pajak",
  "Laporan Keuangan",
  "Dokumen Legal",
  "Supporting Document",
]

const documentCategories = [
  "PPh 21",
  "PPh 23",
  "PPh Badan",
  "PPh OP",
  "PPh Final",
  "PPN",
  "Supporting",
  "Identitas",
  "Legal",
]

export function DocumentUploadDialog({ open, onOpenChange, document, onSuccess }: DocumentUploadDialogProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    client_id: "",
    type: "",
    category: "",
    status: "Final" as "Final" | "Draft" | "Review",
  })

  useEffect(() => {
    if (open) {
      fetchClients().then(setClients)
    }
  }, [open])

  useEffect(() => {
    if (document) {
      setFormData({
        name: document.name,
        client_id: document.client_id,
        type: document.type,
        category: document.category,
        status: document.status,
      })
      setFile(null)
    } else {
      setFormData({
        name: "",
        client_id: "",
        type: "",
        category: "",
        status: "Final",
      })
      setFile(null)
    }
  }, [document, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let filePath = document?.file_path || ""
      let fileSize = document?.file_size || 0

      // Upload file if new file is selected
      if (file) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage.from("documents").upload(fileName, file)

        if (uploadError) throw uploadError

        filePath = uploadData.path
        fileSize = file.size

        // If editing and there's an old file, delete it
        if (document?.file_path) {
          await supabase.storage.from("documents").remove([document.file_path])
        }
      }

      if (document) {
        // Update existing document
        const { error } = await supabase
          .from("documents")
          .update({
            name: formData.name,
            client_id: formData.client_id,
            type: formData.type,
            category: formData.category,
            status: formData.status,
            file_path: filePath,
            file_size: fileSize,
            uploaded_by: "Current User", // Replace with actual user
          })
          .eq("id", document.id)

        if (error) throw error
      } else {
        // Create new document
        if (!file) {
          alert("Silakan pilih file untuk diupload")
          return
        }

        const { error } = await supabase.from("documents").insert({
          name: formData.name,
          client_id: formData.client_id,
          type: formData.type,
          category: formData.category,
          status: formData.status,
          file_path: filePath,
          file_size: fileSize,
          uploaded_by: "Current User", // Replace with actual user
        })

        if (error) throw error
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving document:", error)
      alert("Terjadi kesalahan saat menyimpan dokumen")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{document ? "Edit Dokumen" : "Upload Dokumen Baru"}</DialogTitle>
          <DialogDescription>
            {document ? "Perbarui informasi dokumen atau ganti file" : "Upload dokumen baru ke sistem"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Dokumen *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama dokumen"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Klien *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, client_id: value }))}
                required
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Jenis Dokumen *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Final">Final</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">
              File {document ? "(Opsional - kosongkan jika tidak ingin mengganti file)" : "*"}
            </Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              required={!document}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                File terpilih: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {document && !file && <p className="text-sm text-muted-foreground">File saat ini: {document.name}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : document ? "Perbarui" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Client = Database["public"]["Tables"]["clients"]["Row"]

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSuccess: () => void
}

const serviceOptions = ["PPh 21", "PPh 23", "PPh Badan", "PPh OP", "PPh Final", "PPN", "Konsultasi Pajak"]

export function ClientDialog({ open, onOpenChange, client, onSuccess }: ClientDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "" as "Perusahaan" | "CV" | "Perorangan" | "",
    npwp: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    status: "Aktif" as "Aktif" | "Tidak Aktif",
    services: [] as string[],
  })

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        type: client.type,
        npwp: client.npwp,
        contact_person: client.contact_person,
        phone: client.phone || "",
        email: client.email || "",
        address: client.address || "",
        status: client.status,
        services: client.services || [],
      })
    } else {
      setFormData({
        name: "",
        type: "",
        npwp: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        status: "Aktif",
        services: [],
      })
    }
  }, [client, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (client) {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update({
            name: formData.name,
            type: formData.type as "Perusahaan" | "CV" | "Perorangan",
            npwp: formData.npwp,
            contact_person: formData.contact_person,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            status: formData.status,
            services: formData.services,
          })
          .eq("id", client.id)

        if (error) throw error
      } else {
        // Create new client
        const { error } = await supabase.from("clients").insert({
          name: formData.name,
          type: formData.type as "Perusahaan" | "CV" | "Perorangan",
          npwp: formData.npwp,
          contact_person: formData.contact_person,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          status: formData.status,
          services: formData.services,
        })

        if (error) throw error
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving client:", error)
      alert("Terjadi kesalahan saat menyimpan data klien")
    } finally {
      setLoading(false)
    }
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, service],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s !== service),
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Klien" : "Tambah Klien Baru"}</DialogTitle>
          <DialogDescription>{client ? "Perbarui informasi klien" : "Masukkan informasi klien baru"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Klien *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Jenis *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as any }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perusahaan">Perusahaan</SelectItem>
                  <SelectItem value="CV">CV</SelectItem>
                  <SelectItem value="Perorangan">Perorangan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="npwp">NPWP *</Label>
              <Input
                id="npwp"
                value={formData.npwp}
                onChange={(e) => setFormData((prev) => ({ ...prev, npwp: e.target.value }))}
                placeholder="00.000.000.0-000.000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Kontak Person *</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData((prev) => ({ ...prev, contact_person: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+62 21 1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Alamat lengkap klien"
            />
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
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Layanan</Label>
            <div className="grid grid-cols-2 gap-2">
              {serviceOptions.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={formData.services.includes(service)}
                    onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                  />
                  <Label htmlFor={service} className="text-sm">
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : client ? "Perbarui" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

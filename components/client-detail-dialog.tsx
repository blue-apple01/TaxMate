"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, Mail, Calendar, Building2 } from "lucide-react"
import type { Database } from "@/lib/supabase"

type Client = Database["public"]["Tables"]["clients"]["Row"]

interface ClientDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
}

export function ClientDetailDialog({ open, onOpenChange, client }: ClientDetailDialogProps) {
  if (!client) return null

  const getTypeBadge = (type: string) => {
    const colors = {
      Perusahaan: "bg-blue-100 text-blue-800",
      CV: "bg-purple-100 text-purple-800",
      Perorangan: "bg-orange-100 text-orange-800",
    }
    return (
      <Badge variant="secondary" className={colors[type as keyof typeof colors]}>
        {type}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    return status === "Aktif" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Aktif
      </Badge>
    ) : (
      <Badge variant="secondary">Tidak Aktif</Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Detail Klien</span>
          </DialogTitle>
          <DialogDescription>Informasi lengkap tentang klien</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{client.name}</h3>
              <div className="flex items-center space-x-2">
                {getTypeBadge(client.type)}
                {getStatusBadge(client.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">NPWP</p>
                <p className="font-medium">{client.npwp}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Kontak Person</p>
                <p className="font-medium">{client.contact_person}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="font-medium">Informasi Kontak</h4>
            <div className="space-y-2">
              {client.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div className="space-y-3">
            <h4 className="font-medium">Layanan</h4>
            <div className="flex flex-wrap gap-2">
              {client.services && client.services.length > 0 ? (
                client.services.map((service, index) => (
                  <Badge key={index} variant="outline">
                    {service}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada layanan yang dipilih</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Dibuat</p>
              <div className="flex items-center">
                <Calendar className="mr-2 h-3 w-3" />
                <span>{new Date(client.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Terakhir Diperbarui</p>
              <div className="flex items-center">
                <Calendar className="mr-2 h-3 w-3" />
                <span>{new Date(client.updated_at).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

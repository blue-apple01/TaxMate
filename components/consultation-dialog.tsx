"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, User, Video, Phone, MessageSquare } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Client = Database["public"]["Tables"]["clients"]["Row"]
type Consultation = Database["public"]["Tables"]["consultations"]["Row"]

interface ConsultationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
}

export function ConsultationDialog({ open, onOpenChange, client }: ConsultationDialogProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (client && open) {
      fetchConsultations()
    }
  }, [client, open])

  const fetchConsultations = async () => {
    if (!client) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("client_id", client.id)
        .order("consultation_date", { ascending: false })

      if (error) throw error
      setConsultations(data || [])
    } catch (error) {
      console.error("Error fetching consultations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      Scheduled: { variant: "default" as const, className: "bg-blue-100 text-blue-800" },
      Completed: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      Cancelled: { variant: "destructive" as const },
    }

    const { variant, className } = config[status as keyof typeof config]
    return (
      <Badge variant={variant} className={className}>
        {status}
      </Badge>
    )
  }

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "Video Call":
        return <Video className="h-4 w-4" />
      case "Phone Call":
        return <Phone className="h-4 w-4" />
      case "Meeting":
        return <User className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Jadwal Konsultasi - {client.name}</span>
          </DialogTitle>
          <DialogDescription>Daftar konsultasi yang telah dijadwalkan untuk klien ini</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : consultations.length > 0 ? (
            consultations.map((consultation) => (
              <div key={consultation.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{consultation.topic}</h4>
                      {getStatusBadge(consultation.status)}
                    </div>

                    {consultation.description && (
                      <p className="text-sm text-muted-foreground">{consultation.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {consultation.consultation_date && (
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(consultation.consultation_date).toLocaleDateString("id-ID")}
                        </div>
                      )}

                      {consultation.consultation_date && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(consultation.consultation_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}

                      {consultation.duration && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {consultation.duration} menit
                        </div>
                      )}

                      {consultation.consultant && (
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {consultation.consultant}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {consultation.type && getTypeIcon(consultation.type)}
                    <span className="text-sm text-muted-foreground">{consultation.type}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada konsultasi yang dijadwalkan untuk klien ini</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, Calendar, User, DollarSign, FileText } from "lucide-react"
import { supabase, type Database } from "@/lib/supabase"
import { WorksheetDialog } from "@/components/worksheet-dialog"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Worksheet = Database["public"]["Tables"]["worksheets"]["Row"]

export default function WorksheetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const fetchWorksheet = async () => {
    try {
      const { data, error } = await supabase.from("worksheets").select("*").eq("id", params.id).single()

      if (error) throw error
      setWorksheet(data)
    } catch (error) {
      console.error("Error fetching worksheet:", error)
      toast.error("Gagal memuat data lembar kerja")
      router.push("/worksheets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorksheet()
  }, [params.id])

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("worksheets").delete().eq("id", params.id)

      if (error) throw error

      toast.success("Lembar kerja berhasil dihapus")
      router.push("/worksheets")
    } catch (error) {
      console.error("Error deleting worksheet:", error)
      toast.error("Gagal menghapus lembar kerja")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Selesai: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      "Dalam Proses": { variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      "Menunggu Review": { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      Draft: { variant: "outline" as const, className: "" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Draft"]

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    )
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Rp 0"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!worksheet) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Lembar kerja tidak ditemukan</p>
          <Button onClick={() => router.push("/worksheets")} className="mt-4">
            Kembali ke Daftar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/worksheets")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Lembar Kerja</h1>
            <p className="text-muted-foreground">
              {worksheet.client_name} - {worksheet.type}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Lembar Kerja</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus lembar kerja ini? Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
            <CardDescription>Detail informasi lembar kerja pajak</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(worksheet.status)}
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Klien</p>
                  <p className="text-sm text-muted-foreground">{worksheet.client_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Jenis Pajak</p>
                  <p className="text-sm text-muted-foreground">{worksheet.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Periode</p>
                  <p className="text-sm text-muted-foreground">{worksheet.period}</p>
                </div>
              </div>
              {worksheet.assignee && (
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Penanggung Jawab</p>
                    <p className="text-sm text-muted-foreground">{worksheet.assignee}</p>
                  </div>
                </div>
              )}
              {worksheet.amount && (
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Jumlah</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(worksheet.amount)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tambahan</CardTitle>
            <CardDescription>Catatan dan riwayat perubahan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {worksheet.notes && (
              <div>
                <p className="text-sm font-medium mb-2">Catatan:</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{worksheet.notes}</p>
              </div>
            )}
            <Separator />
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Dibuat:</p>
                <p className="text-sm text-muted-foreground">{formatDate(worksheet.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Terakhir Diperbarui:</p>
                <p className="text-sm text-muted-foreground">{formatDate(worksheet.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <WorksheetDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        worksheet={worksheet}
        onSuccess={fetchWorksheet}
      />
    </div>
  )
}

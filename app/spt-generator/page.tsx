"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  FileText,
  Calculator,
  Download,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Edit,
  Share,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { SPTDialog } from "@/components/spt-dialog"
import { toast } from "@/hooks/use-toast"

interface SPTData {
  id: string
  title: string
  type: string
  period: string
  status: "Dalam Proses" | "Review" | "Selesai"
  amount: number | null
  due_date: string | null
  progress: number
  created_by: string | null
  created_at: string
  clients: { name: string }
}

const sptTemplates = [
  {
    id: "pph21",
    name: "SPT Masa PPh 21",
    description: "Pajak Penghasilan Pasal 21 - Gaji Karyawan",
    icon: User,
    color: "bg-blue-100 text-blue-800",
    deadline: "10 setiap bulan",
    complexity: "Sedang",
  },
  {
    id: "pph23",
    name: "SPT Masa PPh 23",
    description: "Pajak Penghasilan Pasal 23 - Jasa dan Sewa",
    icon: FileText,
    color: "bg-green-100 text-green-800",
    deadline: "20 setiap bulan",
    complexity: "Sedang",
  },
  {
    id: "ppn",
    name: "SPT Masa PPN",
    description: "Pajak Pertambahan Nilai",
    icon: Calculator,
    color: "bg-purple-100 text-purple-800",
    deadline: "Akhir bulan berikutnya",
    complexity: "Tinggi",
  },
  {
    id: "pph-badan",
    name: "SPT Tahunan PPh Badan",
    description: "Pajak Penghasilan Badan",
    icon: Building2,
    color: "bg-orange-100 text-orange-800",
    deadline: "30 April",
    complexity: "Tinggi",
  },
]

export default function SPTGeneratorPage() {
  const [sptForms, setSptForms] = useState<SPTData[]>([])
  const [filteredSPTs, setFilteredSPTs] = useState<SPTData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSPT, setSelectedSPT] = useState<SPTData | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
  })

  useEffect(() => {
    fetchSPTForms()
  }, [])

  useEffect(() => {
    filterSPTs()
  }, [sptForms, searchTerm, statusFilter])

  const fetchSPTForms = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("spt_forms")
        .select(`
          *,
          clients (name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setSptForms(data || [])

      // Calculate stats
      const total = data?.length || 0
      const inProgress = data?.filter((s) => s.status === "Dalam Proses").length || 0
      const review = data?.filter((s) => s.status === "Review").length || 0
      const completed = data?.filter((s) => s.status === "Selesai").length || 0

      setStats({ total, inProgress, review, completed })
    } catch (error) {
      console.error("Error fetching SPT forms:", error)
      toast({ title: "Gagal memuat data SPT", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filterSPTs = () => {
    let filtered = sptForms

    if (searchTerm) {
      filtered = filtered.filter(
        (spt) =>
          spt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          spt.clients.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          spt.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((spt) => {
        switch (statusFilter) {
          case "in-progress":
            return spt.status === "Dalam Proses"
          case "review":
            return spt.status === "Review"
          case "completed":
            return spt.status === "Selesai"
          default:
            return true
        }
      })
    }

    setFilteredSPTs(filtered)
  }

  const handleEdit = (spt: SPTData) => {
    setSelectedSPT(spt)
    setDialogOpen(true)
  }

  const handleView = (spt: SPTData) => {
    toast({ title: `Melihat SPT: ${spt.title}` })
  }

  const handleDownload = (spt: SPTData) => {
    toast({ title: `Mengunduh SPT: ${spt.title}` })
  }

  const handleShare = (spt: SPTData) => {
    toast({ title: `Membagikan SPT: ${spt.title}` })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      "Dalam Proses": { variant: "default" as const, className: "bg-blue-100 text-blue-800" },
      Review: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      Selesai: { variant: "default" as const, className: "bg-green-100 text-green-800" },
    }

    const { variant, className } = config[status as keyof typeof config]
    return (
      <Badge variant={variant} className={className}>
        {status}
      </Badge>
    )
  }

  const getComplexityBadge = (complexity: string) => {
    const config = {
      Rendah: { className: "bg-green-100 text-green-800" },
      Sedang: { className: "bg-yellow-100 text-yellow-800" },
      Tinggi: { className: "bg-red-100 text-red-800" },
    }

    const { className } = config[complexity as keyof typeof config] || config["Sedang"]
    return (
      <Badge variant="secondary" className={className}>
        {complexity}
      </Badge>
    )
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading SPT data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generator SPT</h1>
          <p className="text-muted-foreground">Buat dan kelola Surat Pemberitahuan Tahunan secara otomatis</p>
        </div>
        <Button
          onClick={() => {
            setSelectedSPT(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Buat SPT Baru
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SPT</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">SPT terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Sedang dikerjakan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.review}</div>
            <p className="text-xs text-muted-foreground">Menunggu review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Telah diselesaikan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* SPT Templates */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Template SPT Tersedia</CardTitle>
            <CardDescription>Pilih template sesuai dengan jenis kewajiban perpajakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sptTemplates.map((template) => {
                const Icon = template.icon
                return (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${template.color.split(" ")[0]} w-fit`}>
                          <Icon className={`h-5 w-5 ${template.color.split(" ")[1]}`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium text-sm">{template.name}</h3>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Deadline: {template.deadline}</p>
                              <div className="flex items-center space-x-2">
                                {getComplexityBadge(template.complexity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* SPT Creation Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Buat SPT Baru</CardTitle>
            <CardDescription>Gunakan template atau buat SPT kustom untuk klien Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Siap membuat SPT baru?</h3>
              <p className="text-muted-foreground mb-4">
                Pilih template di sebelah kiri atau klik tombol di bawah untuk memulai
              </p>
              <Button
                onClick={() => {
                  setSelectedSPT(null)
                  setDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Mulai Buat SPT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SPT List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar SPT</CardTitle>
              <CardDescription>Kelola semua SPT yang telah dibuat</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Cari SPT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="in-progress">Dalam Proses</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="completed">Selesai</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Klien</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSPTs.map((spt) => (
                    <TableRow key={spt.id}>
                      <TableCell className="font-medium">{spt.title}</TableCell>
                      <TableCell>{spt.clients.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{spt.type}</Badge>
                      </TableCell>
                      <TableCell>{spt.period}</TableCell>
                      <TableCell>{getStatusBadge(spt.status)}</TableCell>
                      <TableCell>{formatCurrency(spt.amount)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{spt.progress}%</span>
                          </div>
                          <Progress value={spt.progress} className="h-2 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>{spt.due_date ? new Date(spt.due_date).toLocaleDateString("id-ID") : "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleView(spt)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(spt)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(spt)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleShare(spt)}>
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSPTs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Tidak ada SPT yang ditemukan</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SPTDialog open={dialogOpen} onOpenChange={setDialogOpen} spt={selectedSPT} onSuccess={fetchSPTForms} />
    </div>
  )
}

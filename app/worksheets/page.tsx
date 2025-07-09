"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Users, Building2, Receipt, TrendingUp, Plus, Search, Filter } from "lucide-react"
import { supabase, type Database } from "@/lib/supabase"
import { WorksheetDialog } from "@/components/worksheet-dialog"
import { toast } from "sonner"

type Worksheet = Database["public"]["Tables"]["worksheets"]["Row"]

const worksheetTypes = [
  {
    id: "PPh 21",
    name: "PPh 21",
    description: "Pajak Penghasilan Pasal 21 - Gaji Karyawan",
    icon: Users,
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "PPh 23",
    name: "PPh 23",
    description: "Pajak Penghasilan Pasal 23 - Jasa dan Sewa",
    icon: Receipt,
    color: "bg-green-100 text-green-800",
  },
  {
    id: "PPN",
    name: "PPN",
    description: "Pajak Pertambahan Nilai",
    icon: Calculator,
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "PPh Badan",
    name: "PPh Badan",
    description: "Pajak Penghasilan Badan",
    icon: Building2,
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "PPh Final UMKM",
    name: "PPh Final UMKM",
    description: "PPh Final berdasarkan PP 23/2018",
    icon: TrendingUp,
    color: "bg-pink-100 text-pink-800",
  },
]

export default function WorksheetsPage() {
  const router = useRouter()
  const [worksheets, setWorksheets] = useState<Worksheet[]>([])
  const [filteredWorksheets, setFilteredWorksheets] = useState<Worksheet[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchWorksheets = async () => {
    try {
      const { data, error } = await supabase.from("worksheets").select("*").order("updated_at", { ascending: false })

      if (error) throw error
      setWorksheets(data || [])
      setFilteredWorksheets(data || [])
    } catch (error) {
      console.error("Error fetching worksheets:", error)
      toast.error("Gagal memuat data lembar kerja")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorksheets()
  }, [])

  useEffect(() => {
    let filtered = worksheets

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((worksheet) => worksheet.status === selectedStatus)
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((worksheet) => worksheet.type === selectedType)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (worksheet) =>
          worksheet.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          worksheet.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          worksheet.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (worksheet.assignee && worksheet.assignee.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredWorksheets(filtered)
  }, [worksheets, selectedStatus, selectedType, searchQuery])

  const getWorksheetStats = () => {
    return worksheetTypes.map((type) => {
      const typeWorksheets = worksheets.filter((w) => w.type === type.id)
      const completed = typeWorksheets.filter((w) => w.status === "Selesai").length
      const inProgress = typeWorksheets.filter((w) => w.status === "Dalam Proses").length
      const pending = typeWorksheets.filter((w) => w.status === "Draft" || w.status === "Menunggu Review").length

      return {
        ...type,
        count: typeWorksheets.length,
        completed,
        inProgress,
        pending,
      }
    })
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
      month: "short",
      day: "numeric",
    })
  }

  const worksheetStats = getWorksheetStats()

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lembar Kerja Pajak</h1>
          <p className="text-muted-foreground">Kelola perhitungan pajak untuk semua jenis kewajiban perpajakan</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Lembar Kerja
        </Button>
      </div>

      {/* Worksheet Types Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {worksheetStats.map((type) => {
          const Icon = type.icon
          const completionRate = type.count > 0 ? (type.completed / type.count) * 100 : 0

          return (
            <Card key={type.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${type.color.split(" ")[0]} w-fit`}>
                    <Icon className={`h-4 w-4 ${type.color.split(" ")[1]}`} />
                  </div>
                  <Badge variant="secondary">{type.count}</Badge>
                </div>
                <CardTitle className="text-lg">{type.name}</CardTitle>
                <CardDescription className="text-xs">{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(completionRate)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{type.completed}</div>
                      <div className="text-muted-foreground">Selesai</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{type.inProgress}</div>
                      <div className="text-muted-foreground">Proses</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-orange-600">{type.pending}</div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Lembar Kerja</CardTitle>
          <CardDescription>Kelola dan pantau semua lembar kerja pajak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan klien, jenis pajak, periode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Jenis Pajak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {worksheetTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                <SelectItem value="Menunggu Review">Menunggu Review</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Semua ({filteredWorksheets.length})</TabsTrigger>
              <TabsTrigger value="in-progress">
                Dalam Proses ({filteredWorksheets.filter((w) => w.status === "Dalam Proses").length})
              </TabsTrigger>
              <TabsTrigger value="review">
                Menunggu Review ({filteredWorksheets.filter((w) => w.status === "Menunggu Review").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Selesai ({filteredWorksheets.filter((w) => w.status === "Selesai").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredWorksheets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {worksheets.length === 0 ? "Belum ada lembar kerja" : "Tidak ada data yang sesuai dengan filter"}
                </div>
              ) : (
                filteredWorksheets.map((worksheet) => (
                  <div
                    key={worksheet.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/worksheets/${worksheet.id}`)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{worksheet.client_name}</h4>
                        <Badge variant="outline">{worksheet.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Periode: {worksheet.period} • Diperbarui {formatDate(worksheet.updated_at)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {worksheet.assignee && <span>Dikerjakan oleh: {worksheet.assignee}</span>}
                        {worksheet.amount && <span>Jumlah: {formatCurrency(worksheet.amount)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">{getStatusBadge(worksheet.status)}</div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="in-progress">
              {filteredWorksheets
                .filter((w) => w.status === "Dalam Proses")
                .map((worksheet) => (
                  <div
                    key={worksheet.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/worksheets/${worksheet.id}`)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{worksheet.client_name}</h4>
                        <Badge variant="outline">{worksheet.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Periode: {worksheet.period} • Diperbarui {formatDate(worksheet.updated_at)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {worksheet.assignee && <span>Dikerjakan oleh: {worksheet.assignee}</span>}
                        {worksheet.amount && <span>Jumlah: {formatCurrency(worksheet.amount)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">{getStatusBadge(worksheet.status)}</div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="review">
              {filteredWorksheets
                .filter((w) => w.status === "Menunggu Review")
                .map((worksheet) => (
                  <div
                    key={worksheet.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/worksheets/${worksheet.id}`)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{worksheet.client_name}</h4>
                        <Badge variant="outline">{worksheet.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Periode: {worksheet.period} • Diperbarui {formatDate(worksheet.updated_at)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {worksheet.assignee && <span>Dikerjakan oleh: {worksheet.assignee}</span>}
                        {worksheet.amount && <span>Jumlah: {formatCurrency(worksheet.amount)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">{getStatusBadge(worksheet.status)}</div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="completed">
              {filteredWorksheets
                .filter((w) => w.status === "Selesai")
                .map((worksheet) => (
                  <div
                    key={worksheet.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/worksheets/${worksheet.id}`)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{worksheet.client_name}</h4>
                        <Badge variant="outline">{worksheet.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Periode: {worksheet.period} • Diperbarui {formatDate(worksheet.updated_at)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {worksheet.assignee && <span>Dikerjakan oleh: {worksheet.assignee}</span>}
                        {worksheet.amount && <span>Jumlah: {formatCurrency(worksheet.amount)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">{getStatusBadge(worksheet.status)}</div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {worksheetTypes.slice(0, 4).map((type) => {
          const Icon = type.icon
          return (
            <Card
              key={type.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setCreateDialogOpen(true)}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className={`p-3 ${type.color.split(" ")[0]} rounded-lg`}>
                  <Icon className={`h-6 w-6 ${type.color.split(" ")[1]}`} />
                </div>
                <div>
                  <h3 className="font-medium">Hitung {type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.description.split(" - ")[1]}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Dialog */}
      <WorksheetDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={fetchWorksheets} />
    </div>
  )
}

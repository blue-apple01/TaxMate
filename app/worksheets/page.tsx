"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Users, Building2, Receipt, TrendingUp, Plus, Eye, Edit, Download } from "lucide-react"

const worksheetTypes = [
  {
    id: "pph21",
    name: "PPh 21",
    description: "Pajak Penghasilan Pasal 21 - Gaji Karyawan",
    icon: Users,
    color: "bg-blue-100 text-blue-800",
    count: 45,
    completed: 38,
    inProgress: 5,
    pending: 2,
  },
  {
    id: "pph23",
    name: "PPh 23",
    description: "Pajak Penghasilan Pasal 23 - Jasa dan Sewa",
    icon: Receipt,
    color: "bg-green-100 text-green-800",
    count: 32,
    completed: 28,
    inProgress: 3,
    pending: 1,
  },
  {
    id: "ppn",
    name: "PPN",
    description: "Pajak Pertambahan Nilai",
    icon: Calculator,
    color: "bg-purple-100 text-purple-800",
    count: 67,
    completed: 55,
    inProgress: 8,
    pending: 4,
  },
  {
    id: "pph-badan",
    name: "PPh Badan",
    description: "Pajak Penghasilan Badan",
    icon: Building2,
    color: "bg-orange-100 text-orange-800",
    count: 23,
    completed: 18,
    inProgress: 3,
    pending: 2,
  },
  {
    id: "pph-final",
    name: "PPh Final UMKM",
    description: "PPh Final berdasarkan PP 23/2018",
    icon: TrendingUp,
    color: "bg-pink-100 text-pink-800",
    count: 15,
    completed: 12,
    inProgress: 2,
    pending: 1,
  },
]

const recentWorksheets = [
  {
    id: 1,
    client: "PT Teknologi Maju",
    type: "PPh 21",
    period: "Juni 2025",
    status: "Selesai",
    lastModified: "2 jam lalu",
    assignee: "Ahmad Wijaya",
  },
  {
    id: 2,
    client: "CV Berkah Jaya",
    type: "PPN",
    period: "Juni 2025",
    status: "Dalam Proses",
    lastModified: "4 jam lalu",
    assignee: "Siti Rahayu",
  },
  {
    id: 3,
    client: "PT Digital Nusantara",
    type: "PPh 23",
    period: "Juni 2025",
    status: "Menunggu Review",
    lastModified: "1 hari lalu",
    assignee: "Budi Santoso",
  },
  {
    id: 4,
    client: "Ahmad Wijaya",
    type: "PPh OP",
    period: "2024",
    status: "Draft",
    lastModified: "2 hari lalu",
    assignee: "Maria Gonzalez",
  },
]

export default function WorksheetsPage() {
  const [selectedType, setSelectedType] = useState("all")

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lembar Kerja Pajak</h1>
          <p className="text-muted-foreground">Kelola perhitungan pajak untuk semua jenis kewajiban perpajakan</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Buat Lembar Kerja
        </Button>
      </div>

      {/* Worksheet Types Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {worksheetTypes.map((type) => {
          const Icon = type.icon
          const completionRate = (type.completed / type.count) * 100

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

      {/* Recent Worksheets */}
      <Card>
        <CardHeader>
          <CardTitle>Lembar Kerja Terbaru</CardTitle>
          <CardDescription>Aktivitas terbaru pada lembar kerja pajak</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="in-progress">Dalam Proses</TabsTrigger>
              <TabsTrigger value="review">Menunggu Review</TabsTrigger>
              <TabsTrigger value="completed">Selesai</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {recentWorksheets.map((worksheet) => (
                <div
                  key={worksheet.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{worksheet.client}</h4>
                      <Badge variant="outline">{worksheet.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Periode: {worksheet.period} • Dimodifikasi {worksheet.lastModified}
                    </p>
                    <p className="text-xs text-muted-foreground">Dikerjakan oleh: {worksheet.assignee}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(worksheet.status)}
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="in-progress">
              <div className="text-center py-8 text-muted-foreground">
                Menampilkan lembar kerja yang sedang dalam proses...
              </div>
            </TabsContent>

            <TabsContent value="review">
              <div className="text-center py-8 text-muted-foreground">
                Menampilkan lembar kerja yang menunggu review...
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="text-center py-8 text-muted-foreground">
                Menampilkan lembar kerja yang sudah selesai...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Hitung PPh 21</h3>
              <p className="text-sm text-muted-foreground">Perhitungan gaji karyawan</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Hitung PPh 23</h3>
              <p className="text-sm text-muted-foreground">Pajak jasa dan sewa</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calculator className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">Hitung PPN</h3>
              <p className="text-sm text-muted-foreground">Pajak pertambahan nilai</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium">Hitung PPh Badan</h3>
              <p className="text-sm text-muted-foreground">Pajak penghasilan badan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, FileText, Download, Eye } from "lucide-react"

const performanceMetrics = [
  {
    title: "Total Revenue",
    value: "Rp 2.4M",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Klien Aktif",
    value: "248",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "SPT Diselesaikan",
    value: "1,247",
    change: "+15.3%",
    trend: "up",
    icon: FileText,
    color: "text-purple-600",
  },
  {
    title: "Tingkat Kepatuhan",
    value: "98.5%",
    change: "-0.5%",
    trend: "down",
    icon: BarChart3,
    color: "text-orange-600",
  },
]

const clientAnalytics = [
  {
    client: "PT Teknologi Maju",
    revenue: "Rp 450M",
    sptCount: 24,
    complianceRate: 100,
    lastActivity: "2 hari lalu",
    status: "Premium",
  },
  {
    client: "CV Berkah Jaya",
    revenue: "Rp 280M",
    sptCount: 18,
    complianceRate: 95,
    lastActivity: "1 minggu lalu",
    status: "Standard",
  },
  {
    client: "PT Digital Nusantara",
    revenue: "Rp 380M",
    sptCount: 32,
    complianceRate: 98,
    lastActivity: "3 hari lalu",
    status: "Premium",
  },
]

const monthlyData = [
  { month: "Jan", spt: 45, revenue: 180, clients: 42 },
  { month: "Feb", spt: 52, revenue: 195, clients: 45 },
  { month: "Mar", spt: 48, revenue: 210, clients: 48 },
  { month: "Apr", spt: 61, revenue: 225, clients: 52 },
  { month: "May", spt: 55, revenue: 240, clients: 55 },
  { month: "Jun", spt: 67, revenue: 260, clients: 58 },
]

const taxTypeDistribution = [
  { type: "PPh 21", count: 145, percentage: 35, color: "bg-blue-500" },
  { type: "PPh 23", count: 98, percentage: 24, color: "bg-green-500" },
  { type: "PPN", count: 87, percentage: 21, color: "bg-purple-500" },
  { type: "PPh Badan", count: 52, percentage: 13, color: "bg-orange-500" },
  { type: "PPh Final", count: 28, percentage: 7, color: "bg-pink-500" },
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [selectedMetric, setSelectedMetric] = useState("revenue")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">Analisis performa bisnis dan insights mendalam</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon
          const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`mr-1 h-3 w-3 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                  <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>{metric.change}</span>
                  <span className="ml-1">dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trend Performa</CardTitle>
            <CardDescription>Grafik performa 6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="spt">SPT Count</SelectItem>
                    <SelectItem value="clients">Klien Baru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Simple Bar Chart Representation */}
              <div className="space-y-3">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium">{data.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                selectedMetric === "revenue"
                                  ? (data.revenue / 300) * 100
                                  : selectedMetric === "spt"
                                    ? (data.spt / 80) * 100
                                    : (data.clients / 70) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <div className="text-sm font-medium w-16">
                          {selectedMetric === "revenue"
                            ? `${data.revenue}M`
                            : selectedMetric === "spt"
                              ? data.spt
                              : data.clients}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Jenis Pajak</CardTitle>
            <CardDescription>Breakdown berdasarkan jenis SPT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxTypeDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={item.percentage} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-10">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Analisis Klien</CardTitle>
          <CardDescription>Performa dan kontribusi klien terhadap bisnis</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="performance">Performa</TabsTrigger>
              <TabsTrigger value="compliance">Kepatuhan</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              {clientAnalytics.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{client.client}</h4>
                      <Badge variant={client.status === "Premium" ? "default" : "secondary"}>{client.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Revenue: {client.revenue} • SPT: {client.sptCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Aktivitas terakhir: {client.lastActivity}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">Kepatuhan: {client.complianceRate}%</div>
                    <Progress value={client.complianceRate} className="w-24 h-2" />
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="compliance">
              <div className="text-center py-8 text-muted-foreground">
                Analisis tingkat kepatuhan klien akan ditampilkan di sini...
              </div>
            </TabsContent>

            <TabsContent value="revenue">
              <div className="text-center py-8 text-muted-foreground">
                Breakdown revenue per klien akan ditampilkan di sini...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Insight Minggu Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-green-600">↗ 15%</span> peningkatan SPT yang diselesaikan
              </p>
              <p className="text-sm">
                <span className="font-medium text-blue-600">3 klien baru</span> bergabung minggu ini
              </p>
              <p className="text-sm">
                <span className="font-medium text-orange-600">2 deadline</span> mendekati batas waktu
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Ahmad Wijaya</span> - 24 SPT selesai
              </p>
              <p className="text-sm">
                <span className="font-medium">Siti Rahayu</span> - 18 SPT selesai
              </p>
              <p className="text-sm">
                <span className="font-medium">Budi Santoso</span> - 15 SPT selesai
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rekomendasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">• Fokus pada klien dengan tingkat kepatuhan rendah</p>
              <p className="text-sm">• Tingkatkan efisiensi proses PPh 21</p>
              <p className="text-sm">• Pertimbangkan paket premium untuk klien besar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

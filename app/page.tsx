"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, FileText, Calendar, TrendingUp, CheckCircle, DollarSign, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  totalClients: number
  activeClients: number
  sptCompleted: number
  totalRevenue: number
  complianceRate: number
}

interface TodaySchedule {
  id: string
  title: string
  scheduled_date: string
  status: string
  clients: { name: string }
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    sptCompleted: 0,
    totalRevenue: 0,
    complianceRate: 0,
  })
  const [todaySchedules, setTodaySchedules] = useState<TodaySchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [selectedPeriod])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Get date range based on selected period
      const now = new Date()
      let startDate: Date

      switch (selectedPeriod) {
        case "daily":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "yearly":
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default: // monthly
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      // Fetch clients data
      const { data: clients } = await supabase.from("clients").select("*")

      // Fetch SPT records for the period
      const { data: sptRecords } = await supabase
        .from("spt_records")
        .select("*, clients(name)")
        .gte("created_at", startDate.toISOString())

      // Fetch today's schedules
      const today = new Date().toDateString()
      const { data: schedules } = await supabase
        .from("schedules")
        .select("id, title, scheduled_date, status, clients(name)")
        .gte("scheduled_date", new Date(today).toISOString())
        .lt("scheduled_date", new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order("scheduled_date", { ascending: true })
        .limit(5)

      // Calculate stats
      const totalClients = clients?.length || 0
      const activeClients = clients?.filter((c) => c.status === "Aktif").length || 0
      const sptCompleted = sptRecords?.filter((s) => s.status === "Approved").length || 0
      const totalRevenue = sptRecords?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0
      const complianceRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0

      setStats({
        totalClients,
        activeClients,
        sptCompleted,
        totalRevenue,
        complianceRate,
      })

      setTodaySchedules(schedules || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      Pending: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      Selesai: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      Dibatalkan: { variant: "destructive" as const },
    }

    const { variant, className } = config[status as keyof typeof config] || config["Pending"]
    return (
      <Badge variant={variant} className={className}>
        {status}
      </Badge>
    )
  }

  const statsData = [
    {
      title: "Total Klien",
      value: stats.totalClients.toString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "SPT Selesai",
      value: stats.sptCompleted.toString(),
      change: "+8%",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Pendapatan",
      value: formatCurrency(stats.totalRevenue),
      change: "+15%",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Tingkat Kepatuhan",
      value: `${stats.complianceRate.toFixed(1)}%`,
      change: "+2%",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang kembali! Berikut ringkasan aktivitas hari ini.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={selectedPeriod === "daily" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("daily")}
          >
            Harian
          </Button>
          <Button
            variant={selectedPeriod === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("monthly")}
          >
            Bulanan
          </Button>
          <Button
            variant={selectedPeriod === "yearly" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("yearly")}
          >
            Tahunan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> dari periode sebelumnya
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Jadwal Hari Ini
            </CardTitle>
            <CardDescription>Jadwal dan appointment untuk hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedules.length > 0 ? (
                todaySchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{schedule.title}</p>
                      <p className="text-sm text-muted-foreground">{schedule.clients.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(schedule.scheduled_date).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">{getStatusBadge(schedule.status)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada jadwal untuk hari ini</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performa Tim
            </CardTitle>
            <CardDescription>Produktivitas dan efisiensi tim konsultan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>SPT Diselesaikan</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tingkat Akurasi</span>
                <span>98%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Kepuasan Klien</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

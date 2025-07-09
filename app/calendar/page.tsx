"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Clock, AlertTriangle, CheckCircle, Plus, Bell, Eye, Edit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { ScheduleDialog } from "@/components/schedule-dialog"
import { toast } from "@/hooks/use-toast"

interface ScheduleData {
  id: string
  title: string
  description: string | null
  type: string
  status: "Pending" | "Selesai" | "Dibatalkan"
  scheduled_date: string
  duration: number | null
  location: string | null
  reminder_minutes: number
  created_by: string | null
  clients: { name: string }
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [schedules, setSchedules] = useState<ScheduleData[]>([])
  const [todaySchedules, setTodaySchedules] = useState<ScheduleData[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(null)
  const [stats, setStats] = useState({
    totalMonth: 0,
    completed: 0,
    pending: 0,
    todayCount: 0,
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  useEffect(() => {
    if (date) {
      filterTodaySchedules()
    }
  }, [schedules, date, filterType])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          *,
          clients (name)
        `)
        .order("scheduled_date", { ascending: true })

      if (error) throw error

      setSchedules(data || [])

      // Calculate stats
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const monthSchedules =
        data?.filter((s) => {
          const scheduleDate = new Date(s.scheduled_date)
          return scheduleDate >= startOfMonth && scheduleDate <= endOfMonth
        }) || []

      const totalMonth = monthSchedules.length
      const completed = monthSchedules.filter((s) => s.status === "Selesai").length
      const pending = monthSchedules.filter((s) => s.status === "Pending").length

      const today = new Date().toDateString()
      const todayCount = data?.filter((s) => new Date(s.scheduled_date).toDateString() === today).length || 0

      setStats({ totalMonth, completed, pending, todayCount })
    } catch (error) {
      console.error("Error fetching schedules:", error)
      toast({ title: "Gagal memuat data jadwal", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filterTodaySchedules = () => {
    if (!date) return

    const selectedDateStr = date.toDateString()
    let filtered = schedules.filter((schedule) => new Date(schedule.scheduled_date).toDateString() === selectedDateStr)

    if (searchTerm) {
      filtered = filtered.filter(
        (schedule) =>
          schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.clients.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((schedule) => {
        switch (filterType) {
          case "pending":
            return schedule.status === "Pending"
          case "completed":
            return schedule.status === "Selesai"
          default:
            return true
        }
      })
    }

    setTodaySchedules(filtered)
  }

  const handleEdit = (schedule: ScheduleData) => {
    setSelectedSchedule(schedule)
    setScheduleDialogOpen(true)
  }

  const handleView = (schedule: ScheduleData) => {
    toast({ title: `Melihat jadwal: ${schedule.title}` })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      Pending: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      Selesai: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      Dibatalkan: { variant: "destructive" as const },
    }

    const { variant, className } = config[status as keyof typeof config]
    return (
      <Badge variant={variant} className={className}>
        {status}
      </Badge>
    )
  }

  const monthlyStats = [
    {
      title: "Jadwal Bulan Ini",
      value: stats.totalMonth.toString(),
      completed: stats.completed,
      pending: stats.pending,
      icon: CalendarIcon,
    },
    {
      title: "Jadwal Hari Ini",
      value: stats.todayCount.toString(),
      description: "jadwal untuk hari ini",
      icon: Clock,
    },
    {
      title: "Selesai",
      value: stats.completed.toString(),
      description: "jadwal diselesaikan",
      icon: CheckCircle,
    },
    {
      title: "Pending",
      value: stats.pending.toString(),
      description: "menunggu dikerjakan",
      icon: AlertTriangle,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading calendar...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Kalender & Reminder</h1>
          <p className="text-muted-foreground">Kelola jadwal dan deadline kewajiban perpajakan</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setReminderDialogOpen(true)}>
            <Bell className="mr-2 h-4 w-4" />
            Atur Reminder
          </Button>
          <Button
            onClick={() => {
              setSelectedSchedule(null)
              setScheduleDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {monthlyStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.completed !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {stat.completed} selesai, {stat.pending} pending
                  </p>
                )}
                {stat.description && <p className="text-xs text-muted-foreground">{stat.description}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Kalender</CardTitle>
            <CardDescription>Pilih tanggal untuk melihat jadwal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
                classNames={{
                  months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                  month: "space-y-4 w-full flex flex-col",
                  table: "w-full h-full border-collapse space-y-1",
                  head_row: "",
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                  day_range_end: "day-range-end",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Deadline Mendesak</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Deadline Tinggi</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Konsultasi</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Selesai</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Jadwal Hari Ini</CardTitle>
                <CardDescription>
                  {date?.toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Cari jadwal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-40"
                />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {todaySchedules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Klien</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaySchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {new Date(schedule.scheduled_date).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{schedule.title}</TableCell>
                      <TableCell>{schedule.clients.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{schedule.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleView(schedule)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada jadwal untuk tanggal yang dipilih</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        schedule={selectedSchedule}
        selectedDate={date}
        onSuccess={fetchSchedules}
      />

      {/* Reminder Dialog - Simple implementation */}
      {reminderDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Atur Reminder</CardTitle>
              <CardDescription>Pengaturan reminder untuk jadwal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Fitur reminder akan segera tersedia. Saat ini Anda dapat mengatur reminder saat membuat atau mengedit
                jadwal.
              </p>
              <Button className="w-full" onClick={() => setReminderDialogOpen(false)}>
                Tutup
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

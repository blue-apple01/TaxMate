"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

const consultationRequests = [
  {
    id: 1,
    client: "PT Teknologi Maju",
    contact: "Budi Santoso",
    topic: "Konsultasi PPh 21 Karyawan Asing",
    priority: "High",
    status: "Pending",
    requestDate: "2025-07-08",
    preferredDate: "2025-07-10",
    preferredTime: "14:00",
    type: "Video Call",
    description: "Membutuhkan konsultasi mengenai perhitungan PPh 21 untuk karyawan asing yang baru bergabung.",
  },
  {
    id: 2,
    client: "CV Berkah Jaya",
    contact: "Siti Rahayu",
    topic: "Review SPT Masa PPN",
    priority: "Medium",
    status: "Scheduled",
    requestDate: "2025-07-07",
    preferredDate: "2025-07-09",
    preferredTime: "10:00",
    type: "Meeting",
    description: "Review dan validasi SPT Masa PPN sebelum submit ke DJP.",
  },
  {
    id: 3,
    client: "Ahmad Wijaya",
    contact: "Ahmad Wijaya",
    topic: "Perencanaan Pajak 2025",
    priority: "Low",
    status: "Completed",
    requestDate: "2025-07-05",
    preferredDate: "2025-07-06",
    preferredTime: "16:00",
    type: "Phone Call",
    description: "Diskusi strategi perencanaan pajak untuk tahun 2025.",
  },
]

const upcomingConsultations = [
  {
    id: 1,
    client: "PT Digital Nusantara",
    consultant: "Ahmad Wijaya",
    topic: "Audit Preparation",
    date: "2025-07-09",
    time: "09:00",
    duration: "2 jam",
    type: "Meeting",
    location: "Office",
  },
  {
    id: 2,
    client: "CV Sukses Mandiri",
    consultant: "Siti Rahayu",
    topic: "Tax Compliance Review",
    date: "2025-07-09",
    time: "14:00",
    duration: "1 jam",
    type: "Video Call",
    location: "Online",
  },
]

const consultationStats = [
  {
    title: "Total Konsultasi",
    value: "156",
    change: "+12 bulan ini",
    icon: MessageSquare,
  },
  {
    title: "Terjadwal",
    value: "8",
    change: "minggu ini",
    icon: Calendar,
  },
  {
    title: "Selesai",
    value: "142",
    change: "tingkat kepuasan 98%",
    icon: CheckCircle,
  },
  {
    title: "Pending",
    value: "6",
    change: "perlu dijadwalkan",
    icon: AlertCircle,
  },
]

export default function ConsultationPage() {
  const [selectedTab, setSelectedTab] = useState("requests")
  const [newConsultation, setNewConsultation] = useState({
    client: "",
    topic: "",
    priority: "",
    type: "",
    date: "",
    time: "",
    description: "",
  })

  const getPriorityBadge = (priority: string) => {
    const config = {
      High: { variant: "destructive" as const, label: "Tinggi" },
      Medium: { variant: "secondary" as const, label: "Sedang", className: "bg-yellow-100 text-yellow-800" },
      Low: { variant: "outline" as const, label: "Rendah" },
    }

    const { variant, label, className } = config[priority as keyof typeof config]
    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const config = {
      Pending: { variant: "secondary" as const, className: "bg-orange-100 text-orange-800" },
      Scheduled: { variant: "default" as const, className: "bg-blue-100 text-blue-800" },
      Completed: { variant: "default" as const, className: "bg-green-100 text-green-800" },
    }

    const { variant, className } = config[status as keyof typeof config]
    return (
      <Badge variant={variant} className={className}>
        {status}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Konsultasi Klien</h1>
          <p className="text-muted-foreground">Kelola jadwal konsultasi dan komunikasi dengan klien</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Jadwalkan Konsultasi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {consultationStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Jadwalkan Konsultasi</CardTitle>
            <CardDescription>Buat jadwal konsultasi baru dengan klien</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Klien</Label>
              <Select
                value={newConsultation.client}
                onValueChange={(value) => setNewConsultation({ ...newConsultation, client: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih klien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-teknologi">PT Teknologi Maju</SelectItem>
                  <SelectItem value="cv-berkah">CV Berkah Jaya</SelectItem>
                  <SelectItem value="pt-digital">PT Digital Nusantara</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Topik Konsultasi</Label>
              <Input
                placeholder="Masukkan topik konsultasi"
                value={newConsultation.topic}
                onChange={(e) => setNewConsultation({ ...newConsultation, topic: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioritas</Label>
                <Select
                  value={newConsultation.priority}
                  onValueChange={(value) => setNewConsultation({ ...newConsultation, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Tinggi</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="low">Rendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select
                  value={newConsultation.type}
                  onValueChange={(value) => setNewConsultation({ ...newConsultation, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={newConsultation.date}
                  onChange={(e) => setNewConsultation({ ...newConsultation, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Waktu</Label>
                <Input
                  type="time"
                  value={newConsultation.time}
                  onChange={(e) => setNewConsultation({ ...newConsultation, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi konsultasi..."
                value={newConsultation.description}
                onChange={(e) => setNewConsultation({ ...newConsultation, description: e.target.value })}
              />
            </div>

            <Button className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Jadwalkan
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Consultations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Konsultasi Mendatang</CardTitle>
            <CardDescription>Jadwal konsultasi dalam minggu ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{consultation.client}</h4>
                      <Badge variant="outline">{consultation.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{consultation.topic}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(consultation.date).toLocaleDateString("id-ID")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {consultation.time} ({consultation.duration})
                      </div>
                      <div className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        {consultation.consultant}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(consultation.type)}
                    <Button variant="ghost" size="sm">
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultation Management */}
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Konsultasi</CardTitle>
          <CardDescription>Kelola semua permintaan dan jadwal konsultasi</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="requests" className="space-y-4">
            <TabsList>
              <TabsTrigger value="requests">Permintaan</TabsTrigger>
              <TabsTrigger value="scheduled">Terjadwal</TabsTrigger>
              <TabsTrigger value="completed">Selesai</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Cari konsultasi..." className="pl-10" />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>

              {consultationRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{request.client}</h4>
                      {getPriorityBadge(request.priority)}
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm font-medium">{request.topic}</p>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        {request.contact}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        Preferred: {new Date(request.preferredDate).toLocaleDateString("id-ID")} {request.preferredTime}
                      </div>
                      <div className="flex items-center">
                        {getTypeIcon(request.type)}
                        <span className="ml-1">{request.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Respond
                    </Button>
                    <Button size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="scheduled">
              <div className="text-center py-8 text-muted-foreground">
                Konsultasi yang sudah terjadwal akan ditampilkan di sini...
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="text-center py-8 text-muted-foreground">
                Riwayat konsultasi yang sudah selesai akan ditampilkan di sini...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

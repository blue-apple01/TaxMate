"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { ClientDialog } from "@/components/client-dialog"
import { ClientDetailDialog } from "@/components/client-detail-dialog"
import { ConsultationDialog } from "@/components/consultation-dialog"
import type { Database } from "@/lib/supabase"

type Client = Database["public"]["Tables"]["clients"]["Row"]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm, statusFilter, typeFilter])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterClients = () => {
    let filtered = clients

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.npwp.includes(searchTerm) ||
          client.contact_person.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((client) => client.type.toLowerCase() === typeFilter.toLowerCase())
    }

    setFilteredClients(filtered)
  }

  const handleAddClient = () => {
    setSelectedClient(null)
    setClientDialogOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setClientDialogOpen(true)
  }

  const handleViewDetail = (client: Client) => {
    setSelectedClient(client)
    setDetailDialogOpen(true)
  }

  const handleViewConsultations = (client: Client) => {
    setSelectedClient(client)
    setConsultationDialogOpen(true)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading clients...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Klien</h1>
          <p className="text-muted-foreground">Kelola informasi dan layanan untuk semua klien Anda</p>
        </div>
        <Button onClick={handleAddClient}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Klien
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Klien</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Total klien terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Klien Aktif</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.filter((c) => c.status === "Aktif").length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.length > 0
                ? Math.round((clients.filter((c) => c.status === "Aktif").length / clients.length) * 100)
                : 0}
              % dari total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perusahaan</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.filter((c) => c.type === "Perusahaan").length}</div>
            <p className="text-xs text-muted-foreground">Klien korporat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perorangan</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.filter((c) => c.type === "Perorangan").length}</div>
            <p className="text-xs text-muted-foreground">Klien individu</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Klien</CardTitle>
          <CardDescription>Kelola dan pantau semua klien dalam satu tempat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari klien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="tidak aktif">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="perusahaan">Perusahaan</SelectItem>
                <SelectItem value="cv">CV</SelectItem>
                <SelectItem value="perorangan">Perorangan</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Klien</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{client.name}</p>
                          {getTypeBadge(client.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">{client.npwp}</p>
                        {client.address && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {client.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <User className="mr-2 h-3 w-3" />
                          {client.contact_person}
                        </div>
                        {client.phone && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="mr-2 h-3 w-3" />
                            {client.phone}
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="mr-2 h-3 w-3" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.services && client.services.length > 0 ? (
                          client.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-3 w-3" />
                        {new Date(client.created_at).toLocaleDateString("id-ID")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(client)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <User className="mr-2 h-4 w-4" />
                            Edit Klien
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewConsultations(client)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Jadwal Konsultasi
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Tidak ada klien yang sesuai dengan filter"
                : "Belum ada klien yang terdaftar"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        client={selectedClient}
        onSuccess={fetchClients}
      />

      <ClientDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} client={selectedClient} />

      <ConsultationDialog
        open={consultationDialogOpen}
        onOpenChange={setConsultationDialogOpen}
        client={selectedClient}
      />
    </div>
  )
}

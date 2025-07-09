"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Receipt,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const invoiceStats = [
  {
    title: "Total Invoice",
    value: "Rp 24.5M",
    change: "+15% bulan ini",
    icon: Receipt,
    color: "text-blue-600",
  },
  {
    title: "Terbayar",
    value: "Rp 18.2M",
    change: "74% collection rate",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Pending",
    value: "Rp 4.8M",
    change: "12 invoice",
    icon: Clock,
    color: "text-orange-600",
  },
  {
    title: "Overdue",
    value: "Rp 1.5M",
    change: "3 invoice",
    icon: AlertTriangle,
    color: "text-red-600",
  },
]

const invoices = [
  {
    id: "INV-2025-001",
    client: "PT Teknologi Maju",
    service: "SPT Masa PPh 21 - Juni 2025",
    amount: "Rp 2,500,000",
    issueDate: "2025-07-01",
    dueDate: "2025-07-15",
    status: "Paid",
    paymentDate: "2025-07-10",
  },
  {
    id: "INV-2025-002",
    client: "CV Berkah Jaya",
    service: "Konsultasi Pajak + SPT PPN",
    amount: "Rp 1,800,000",
    issueDate: "2025-07-03",
    dueDate: "2025-07-17",
    status: "Pending",
    paymentDate: null,
  },
  {
    id: "INV-2025-003",
    client: "PT Digital Nusantara",
    service: "SPT Tahunan PPh Badan 2024",
    amount: "Rp 5,000,000",
    issueDate: "2025-06-28",
    dueDate: "2025-07-12",
    status: "Overdue",
    paymentDate: null,
  },
  {
    id: "INV-2025-004",
    client: "Ahmad Wijaya",
    service: "SPT Tahunan PPh OP 2024",
    amount: "Rp 750,000",
    issueDate: "2025-07-05",
    dueDate: "2025-07-19",
    status: "Draft",
    paymentDate: null,
  },
]

const services = [
  { name: "SPT Masa PPh 21", price: "Rp 2,500,000" },
  { name: "SPT Masa PPh 23", price: "Rp 2,000,000" },
  { name: "SPT Masa PPN", price: "Rp 3,000,000" },
  { name: "SPT Tahunan PPh Badan", price: "Rp 5,000,000" },
  { name: "SPT Tahunan PPh OP", price: "Rp 750,000" },
  { name: "Konsultasi Pajak (per jam)", price: "Rp 500,000" },
  { name: "Audit Preparation", price: "Rp 7,500,000" },
]

export default function InvoicingPage() {
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [invoiceAmount, setInvoiceAmount] = useState("")

  const getStatusBadge = (status: string) => {
    const config = {
      Paid: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      Pending: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      Overdue: { variant: "destructive" as const },
      Draft: { variant: "outline" as const },
    }

    const { variant, className } = config[status as keyof typeof config]
    return (
      <Badge variant={variant} className={className}>
        {status}
      </Badge>
    )
  }

  const filteredInvoices = invoices // You can add filtering logic here

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoicing & Billing</h1>
          <p className="text-muted-foreground">Kelola invoice, pembayaran, dan penagihan klien</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Buat Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {invoiceStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
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
        {/* Quick Invoice Creation */}
        <Card>
          <CardHeader>
            <CardTitle>Buat Invoice Baru</CardTitle>
            <CardDescription>Buat invoice untuk layanan yang telah diberikan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Klien</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih klien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-teknologi">PT Teknologi Maju</SelectItem>
                  <SelectItem value="cv-berkah">CV Berkah Jaya</SelectItem>
                  <SelectItem value="pt-digital">PT Digital Nusantara</SelectItem>
                  <SelectItem value="ahmad-wijaya">Ahmad Wijaya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Layanan</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih layanan" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service, index) => (
                    <SelectItem key={index} value={service.name}>
                      {service.name} - {service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input placeholder="Rp 0" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Invoice</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Jatuh Tempo</Label>
                <Input type="date" />
              </div>
            </div>

            <Button className="w-full" disabled={!selectedClient || !selectedService}>
              <Receipt className="mr-2 h-4 w-4" />
              Buat Invoice
            </Button>
          </CardContent>
        </Card>

        {/* Service Price List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daftar Harga Layanan</CardTitle>
            <CardDescription>Standar harga untuk berbagai layanan pajak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{service.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Invoice</CardTitle>
          <CardDescription>Kelola semua invoice dan status pembayaran</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="paid">Terbayar</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Cari invoice..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <TabsContent value="all">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Klien</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="font-medium">{invoice.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{invoice.client}</div>
                          <div className="text-sm text-muted-foreground">{invoice.service}</div>
                        </TableCell>
                        <TableCell>{invoice.service}</TableCell>
                        <TableCell>
                          <div className="font-medium">{invoice.amount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            Dibuat: {new Date(invoice.issueDate).toLocaleDateString("id-ID")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Jatuh tempo: {new Date(invoice.dueDate).toLocaleDateString("id-ID")}
                          </div>
                          {invoice.paymentDate && (
                            <div className="text-sm text-green-600">
                              Dibayar: {new Date(invoice.paymentDate).toLocaleDateString("id-ID")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Kirim
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="paid">
              <div className="text-center py-8 text-muted-foreground">
                Invoice yang sudah terbayar akan ditampilkan di sini...
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="text-center py-8 text-muted-foreground">
                Invoice yang pending akan ditampilkan di sini...
              </div>
            </TabsContent>

            <TabsContent value="overdue">
              <div className="text-center py-8 text-muted-foreground">
                Invoice yang overdue akan ditampilkan di sini...
              </div>
            </TabsContent>

            <TabsContent value="draft">
              <div className="text-center py-8 text-muted-foreground">Draft invoice akan ditampilkan di sini...</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Reminders */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reminder Pembayaran</CardTitle>
            <CardDescription>Invoice yang perlu ditagih</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices
                .filter((inv) => inv.status === "Overdue" || inv.status === "Pending")
                .map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{invoice.client}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.id} - {invoice.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Jatuh tempo: {new Date(invoice.dueDate).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(invoice.status)}
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pembayaran</CardTitle>
            <CardDescription>Status pembayaran bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Invoice</span>
                <span className="font-medium">Rp 24.5M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">Terbayar</span>
                <span className="font-medium text-green-600">Rp 18.2M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-600">Pending</span>
                <span className="font-medium text-yellow-600">Rp 4.8M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">Overdue</span>
                <span className="font-medium text-red-600">Rp 1.5M</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Collection Rate</span>
                  <span className="font-bold">74%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

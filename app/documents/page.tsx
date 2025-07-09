"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Search,
  Filter,
  FileText,
  ImageIcon,
  File,
  Download,
  Eye,
  MoreHorizontal,
  Folder,
  Calendar,
  User,
  Edit,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"
import type { Database } from "@/lib/supabase"

type Document = Database["public"]["Tables"]["documents"]["Row"] & {
  clients?: { name: string }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, searchTerm, categoryFilter, statusFilter])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          clients (
            name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = documents

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((doc) => doc.category.toLowerCase() === categoryFilter.toLowerCase())
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredDocuments(filtered)
  }

  const handleUploadDocument = () => {
    setSelectedDocument(null)
    setUploadDialogOpen(true)
  }

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document)
    setUploadDialogOpen(true)
  }

  const handleDownloadDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage.from("documents").download(document.file_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = document.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading document:", error)
      alert("Terjadi kesalahan saat mengunduh dokumen")
    }
  }

  const handleViewDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(document.file_path, 3600) // 1 hour expiry

      if (error) throw error

      // Open in new tab
      window.open(data.signedUrl, "_blank")
    } catch (error) {
      console.error("Error viewing document:", error)
      alert("Terjadi kesalahan saat membuka dokumen")
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-600" />
      case "doc":
      case "docx":
        return <File className="h-4 w-4 text-blue-600" />
      case "xls":
      case "xlsx":
        return <File className="h-4 w-4 text-green-600" />
      case "jpg":
      case "jpeg":
      case "png":
        return <ImageIcon className="h-4 w-4 text-purple-600" />
      default:
        return <File className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      Final: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      Draft: { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" },
      Review: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
    }

    const { variant, className } = config[status as keyof typeof config] || config["Draft"]
    return (
      <Badge variant={variant} className={className}>
        {status}
      </Badge>
    )
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "0 B"
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  // Calculate stats
  const documentStats = [
    {
      title: "Total Dokumen",
      value: documents.length.toString(),
      change: `${
        documents.filter((d) => {
          const today = new Date()
          const docDate = new Date(d.created_at)
          return docDate.toDateString() === today.toDateString()
        }).length
      } hari ini`,
      icon: FileText,
    },
    {
      title: "Menunggu Review",
      value: documents.filter((d) => d.status === "Review").length.toString(),
      change: `${documents.filter((d) => d.status === "Review" && d.category === "PPh 21").length} urgent`,
      icon: Eye,
    },
    {
      title: "Storage Terpakai",
      value: formatFileSize(documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0)),
      change: "dari unlimited",
      icon: Folder,
    },
    {
      title: "Upload Hari Ini",
      value: documents
        .filter((d) => {
          const today = new Date()
          const docDate = new Date(d.created_at)
          return docDate.toDateString() === today.toDateString()
        })
        .length.toString(),
      change: "dokumen baru",
      icon: Upload,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading documents...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Dokumen</h1>
          <p className="text-muted-foreground">Kelola semua dokumen pajak dan supporting documents</p>
        </div>
        <Button onClick={handleUploadDocument}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Dokumen
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {documentStats.map((stat, index) => {
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

      {/* Document Management */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Dokumen</CardTitle>
          <CardDescription>Semua dokumen pajak dan supporting documents</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari dokumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="pph 21">PPh 21</SelectItem>
                <SelectItem value="pph 23">PPh 23</SelectItem>
                <SelectItem value="ppn">PPN</SelectItem>
                <SelectItem value="supporting">Supporting</SelectItem>
                <SelectItem value="identitas">Identitas</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Documents Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dokumen</TableHead>
                  <TableHead>Klien</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Upload Info</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.name)}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(doc.file_size)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{doc.clients?.name || "Unknown Client"}</p>
                        <Badge variant="outline" className="text-xs">
                          {doc.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-3 w-3" />
                          {new Date(doc.created_at).toLocaleDateString("id-ID")}
                        </div>
                        {doc.uploaded_by && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="mr-2 h-3 w-3" />
                            {doc.uploaded_by}
                          </div>
                        )}
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
                          <DropdownMenuItem onClick={() => handleViewDocument(doc)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditDocument(doc)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "Tidak ada dokumen yang sesuai dengan filter"
                : "Belum ada dokumen yang diupload"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        document={selectedDocument}
        onSuccess={fetchDocuments}
      />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Workflow, CheckCircle, Clock, AlertTriangle, Plus, Settings, Eye, Edit, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { WorkflowDialog } from "@/components/workflow-dialog"
import { toast } from "@/hooks/use-toast"

interface WorkflowData {
  id: string
  title: string
  description: string | null
  category: string
  status: "Dalam Proses" | "Menunggu Review" | "Selesai"
  priority: "Low" | "Medium" | "High"
  assignee: string | null
  due_date: string | null
  progress: number
  created_by: string | null
  created_at: string
  clients: { name: string }
}

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
  })

  useEffect(() => {
    fetchWorkflows()
  }, [])

  useEffect(() => {
    filterWorkflows()
  }, [workflows, searchTerm, statusFilter])

  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("workflows")
        .select(`
          *,
          clients (name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setWorkflows(data || [])

      // Calculate stats
      const total = data?.length || 0
      const inProgress = data?.filter((w) => w.status === "Dalam Proses").length || 0
      const review = data?.filter((w) => w.status === "Menunggu Review").length || 0
      const completed = data?.filter((w) => w.status === "Selesai").length || 0

      setStats({ total, inProgress, review, completed })
    } catch (error) {
      console.error("Error fetching workflows:", error)
      toast({ title: "Gagal memuat data workflow", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filterWorkflows = () => {
    let filtered = workflows

    if (searchTerm) {
      filtered = filtered.filter(
        (workflow) =>
          workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workflow.clients.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workflow.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((workflow) => {
        switch (statusFilter) {
          case "in-progress":
            return workflow.status === "Dalam Proses"
          case "review":
            return workflow.status === "Menunggu Review"
          case "completed":
            return workflow.status === "Selesai"
          default:
            return true
        }
      })
    }

    setFilteredWorkflows(filtered)
  }

  const handleEdit = (workflow: WorkflowData) => {
    setSelectedWorkflow(workflow)
    setDialogOpen(true)
  }

  const handleView = (workflow: WorkflowData) => {
    // Implement view functionality
    toast({ title: `Melihat workflow: ${workflow.title}` })
  }

  const handleDownload = (workflow: WorkflowData) => {
    // Implement download functionality
    toast({ title: `Mengunduh workflow: ${workflow.title}` })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      "Dalam Proses": { variant: "default" as const, className: "bg-blue-100 text-blue-800" },
      "Menunggu Review": { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      Selesai: { variant: "default" as const, className: "bg-green-100 text-green-800" },
    }

    const { variant, className } = config[status as keyof typeof config]
    return (
      <Badge variant={variant} className={className}>
        {status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      High: { variant: "destructive" as const },
      Medium: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      Low: { variant: "outline" as const },
    }

    const { variant, className } = config[priority as keyof typeof config]
    return (
      <Badge variant={variant} className={className}>
        {priority === "High" ? "Tinggi" : priority === "Medium" ? "Sedang" : "Rendah"}
      </Badge>
    )
  }

  const workflowStats = [
    {
      title: "Total Workflow",
      value: stats.total.toString(),
      change: "workflow aktif",
      icon: Workflow,
    },
    {
      title: "Dalam Proses",
      value: stats.inProgress.toString(),
      change: "sedang dikerjakan",
      icon: Clock,
    },
    {
      title: "Menunggu Review",
      value: stats.review.toString(),
      change: "perlu review",
      icon: AlertTriangle,
    },
    {
      title: "Selesai",
      value: stats.completed.toString(),
      change: "telah diselesaikan",
      icon: CheckCircle,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading workflows...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
          <p className="text-muted-foreground">Kelola dan otomatisasi proses kerja untuk efisiensi maksimal</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Template
          </Button>
          <Button
            onClick={() => {
              setSelectedWorkflow(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Lembar Kerja
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {workflowStats.map((stat, index) => {
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

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Lembar Kerja</CardTitle>
              <CardDescription>Kelola semua lembar kerja workflow</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Cari workflow..."
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
              <TabsTrigger value="review">Menunggu Review</TabsTrigger>
              <TabsTrigger value="completed">Selesai</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Klien</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium">{workflow.title}</TableCell>
                      <TableCell>{workflow.clients.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{workflow.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                      <TableCell>{getPriorityBadge(workflow.priority)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{workflow.progress}%</span>
                          </div>
                          <Progress value={workflow.progress} className="h-2 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>{workflow.assignee || "-"}</TableCell>
                      <TableCell>
                        {workflow.due_date ? new Date(workflow.due_date).toLocaleDateString("id-ID") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleView(workflow)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(workflow)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(workflow)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredWorkflows.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Tidak ada workflow yang ditemukan</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <WorkflowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workflow={selectedWorkflow}
        onSuccess={fetchWorkflows}
      />
    </div>
  )
}

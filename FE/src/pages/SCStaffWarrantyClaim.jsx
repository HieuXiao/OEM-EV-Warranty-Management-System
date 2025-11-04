import { useState, useEffect } from "react"
import { Search, Filter, Eye, Plus, ArrowUpDown, Calendar } from "lucide-react"
import SCStaffSidebar from "@/components/scstaff/ScsSidebar"
import Header from "@/components/Header"
import ScsWarrCreate from "@/components/scstaff/ScsWarrCreate"
import ScsWarrDetail from "@/components/scstaff/ScsWarrDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import useAuth from "@/hook/useAuth"
import axiosPrivate from "@/api/axios"

const getStatusColor = (status) => {
  const colors = {
    CHECK: "bg-blue-100 text-blue-800 border-blue-300",
    DECIDE: "bg-yellow-100 text-yellow-800 border-yellow-300",
    REPAIR: "bg-orange-100 text-orange-700 border-orange-300",
    HANDOVER: "bg-purple-100 text-purple-800 border-purple-300",
    DONE: "bg-green-100 text-green-800 border-green-300",
  }
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
}

const getDefaultDateFrom = () => {
  const date = new Date()
  date.setDate(date.getDate() - 10)
  return date.toISOString().split("T")[0]
}

const getDefaultDateTo = () => {
  return new Date().toISOString().split("T")[0]
}

export default function SCStaffWarrantyClaim() {
  const { auth } = useAuth()
  const currentUser = {
    id: auth?.accountId,
    name: auth?.fullName,
    role: auth?.role,
  }

  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom())
  const [dateTo, setDateTo] = useState(getDefaultDateTo())
  const [sortBy, setSortBy] = useState("date-desc")

  // Fetch claims list
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true)
        const response = await axiosPrivate.get("/api/warranty-claims", {
          params: { dateFrom, dateTo },
        })
        setClaims(Array.isArray(response.data) ? response.data : [])
        console.log("[WarrantyClaim] Claims fetched:", response.data)
        console.log("[WarrantyClaim] Auth:", auth)
      } catch (error) {
        console.error("Failed to fetch claims:", error)
        setClaims([])
      } finally {
        setLoading(false)
      }
    }

    fetchClaims()
  }, [dateFrom, dateTo])

  const handleSetToday = () => {
    setDateFrom(getDefaultDateFrom())
    setDateTo(getDefaultDateTo())
  }

  // 🔹 Filter + Sort logic
  const filteredClaims = claims
    // Thêm lọc theo accountId hiện tại (so sánh không phân biệt hoa/thường)
    .filter(
      (claim) =>
        claim.serviceCenterStaffId?.toUpperCase() === auth?.accountId?.toUpperCase()
    )
    .filter((claim) => {
      const matchesSearch =
        claim.claimId?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.vin?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || claim.status === statusFilter

      const claimDate = new Date(claim.claimDate)
      const matchesDateFrom = !dateFrom || claimDate >= new Date(dateFrom)
      const matchesDateTo = !dateTo || claimDate <= new Date(dateTo + "T23:59:59")

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
    })
    .sort((a, b) => {
      const dateA = new Date(a.claimDate)
      const dateB = new Date(b.claimDate)

      // Lấy serial từ claimId (3 số cuối)
      const serialA = parseInt(a.claimId?.split("-").pop()) || 0
      const serialB = parseInt(b.claimId?.split("-").pop()) || 0

      switch (sortBy) {
        case "date-desc":
          if (dateB.getTime() === dateA.getTime()) {
            // Nếu cùng ngày → claim có serial cao hơn lên trên
            return serialB - serialA
          }
          return dateB - dateA

        case "date-asc":
          if (dateA.getTime() === dateB.getTime()) {
            // Nếu cùng ngày → claim có serial thấp hơn lên trên
            return serialA - serialB
          }
          return dateA - dateB

        case "status":
          return a.status.localeCompare(b.status)

        default:
          return 0
      }
    })

  // Summary counters
  const totalClaims = claims.length
  const checkClaims = claims.filter((claim) => claim.status === "CHECK").length
  const decideClaims = claims.filter((claim) => claim.status === "DECIDE").length
  const repairClaims = claims.filter((claim) => claim.status === "REPAIR").length
  const doneClaims = claims.filter((claim) => claim.status === "DONE").length

  const handleViewClaim = (claim) => {
    setSelectedClaim(claim)
    setIsDetailDialogOpen(true)
  }

  // Refresh after claim created
  const handleClaimCreated = () => {
    const fetchClaims = async () => {
      try {
        const response = await axiosPrivate.get("/api/warranty-claims", {
          params: { dateFrom, dateTo },
        })
        setClaims(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Failed to refresh claims:", error)
      }
    }
    fetchClaims()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SCStaffSidebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Dashboard Counters */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Total Claims", value: totalClaims },
                { label: "Check", value: checkClaims },
                { label: "Decide", value: decideClaims },
                { label: "Repair", value: repairClaims },
                { label: "Done", value: doneClaims },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filter + Search */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by claim number or VIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="DECIDE">Decide</SelectItem>
                  <SelectItem value="REPAIR">Repair</SelectItem>
                  <SelectItem value="HANDOVER">Handover</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>

            {/* Date Range + Sort */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="date-from" className="text-sm font-medium whitespace-nowrap">
                  From:
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[160px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="date-to" className="text-sm font-medium whitespace-nowrap">
                  To:
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[160px]"
                />
              </div>

              <Button variant="outline" size="sm" onClick={handleSetToday} className="gap-2 bg-transparent">
                <Calendar className="h-4 w-4" />
                Today
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="status">Status (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary info */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredClaims.length} of {totalClaims} claims
              </p>
            </div>

            {/* Claims list */}
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Loading claims...</p>
                  </CardContent>
                </Card>
              ) : filteredClaims.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No claims found
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredClaims.map((claim) => (
                  <Card key={claim.claimId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold">Claim #{claim.claimId}</h3>
                            <Badge variant="outline" className={getStatusColor(claim.status)}>
                              {claim.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">VIN: </span>
                              <span className="font-medium">{claim.vin}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date: </span>
                              <span className="font-medium">{claim.claimDate}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClaim(claim)}
                          className="ml-4"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ScsWarrCreate
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        currentUser={currentUser}
        onClaimCreated={handleClaimCreated}
      />

      <ScsWarrDetail
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        selectedClaim={selectedClaim}
      />
    </div>
  )
}

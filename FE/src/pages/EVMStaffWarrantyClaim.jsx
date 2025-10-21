import { useState } from "react";
import { Search, Filter, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import EVMStaffSideBar from "@/components/evmstaff/EVMStaffSideBar";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EVMStaffDetailWarranty from "@/components/evmstaff/EVMStaffDetailWarranty";
import { mockEVMWarrantyClaims } from "@/lib/Mock-data";

export default function EVMStaffWarrantyClaim() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterVehicleModel, setFilterVehicleModel] = useState("all")
  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [showWarrantyDetail, setShowWarrantyDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  }

  const filteredWarranties = mockEVMWarrantyClaims.filter((claim) => {
    const matchesSearch =
      claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.vehicle && claim.vehicle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (claim.model && claim.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      claim.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || claim.decision === filterStatus
    const matchesVehicleModel = filterVehicleModel === "all" || claim.vehicle === filterVehicleModel
    return matchesSearch && matchesStatus && matchesVehicleModel
  })

  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage)
  const paginatedWarranties = filteredWarranties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleViewWarranty = (warranty) => {
    setSelectedWarranty(warranty)
    setShowWarrantyDetail(true)
  }

  const getStatusBadge = (decision) => {
      // border-only pill; keep original casing (do not uppercase)
      const s = String(decision || "").toLowerCase();
      const map = {
        done: "text-green-700 border-green-400",
        cancel: "text-red-700 border-red-400",
        'on going': "text-yellow-700 border-yellow-400",
        'to do': "text-blue-700 border-blue-400",
      };
      const cls = map[s] || "text-gray-700 border-gray-300";
      return (
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-medium border bg-transparent min-w-[100px] ${cls}`}>
          {decision}
        </span>
      )
  }

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar image={user.image} name={user.name} role={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header name={user.name} email={user.email} image={user.image} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Warranty Claim Management</h1>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Vehicle Model filter (shows vehicle type values) */}
              <Select value={filterVehicleModel} onValueChange={setFilterVehicleModel}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Vehicle Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicle Models</SelectItem>
                  {Array.from(new Set(mockEVMWarrantyClaims.map((c) => c.vehicle))).map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="to do">To Do</SelectItem>
                  <SelectItem value="on going">On Going</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full overflow-x-auto">
              <Table className="table-fixed w-full border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Claim ID</TableHead>
                    <TableHead className="w-[160px]">Vehicle Type</TableHead>
                    <TableHead className="w-[160px]">Vehicle Model</TableHead>
                    <TableHead className="w-[160px]">Issue number</TableHead>
                    <TableHead className="w-[80px] text-center">View</TableHead>
                    <TableHead className="w-[120px] text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWarranties.map((claim) => (
                    <TableRow key={`claim-${claim.id}`}>
                      <TableCell className="font-medium align-middle">{claim.claimId}</TableCell>
                      {/* Vehicle Type (may be empty) - use claim.model when available */}
                      {/*type here*/}
                      <TableCell className="align-middle">{""}</TableCell>
                      {/* Vehicle Model - show claim.vehicle */}
                      <TableCell className="align-middle">{claim.vehicle}</TableCell>
                      <TableCell className="align-middle">{claim.issueNumber}</TableCell>
                      <TableCell className="align-middle text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex items-center justify-center mx-auto"
                          onClick={() => handleViewWarranty(claim)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="align-middle text-center">
                        {getStatusBadge(claim.decision)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>

      <EVMStaffDetailWarranty
        open={showWarrantyDetail}
        onOpenChange={setShowWarrantyDetail}
        warranty={selectedWarranty}
      />
    </div>
  )
}

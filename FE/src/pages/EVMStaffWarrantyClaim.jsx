import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import EVMStaffSideBar from "@/components/evmstaff/EVMStaffSideBar";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EVMStaffDetailWarranty from "@/components/evmstaff/EVMStaffDetailWarranty";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";

const API_ENDPOINTS = {
  CLAIMS: "/api/warranty-claims",
  VEHICLES: "/api/vehicles",
};

export default function EVMStaffWarrantyClaim() {
  const { auth } = useAuth();
  const evmId = auth?.accountId || auth?.id || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVehicleModel, setFilterVehicleModel] = useState("all");
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [showWarrantyDetail, setShowWarrantyDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [warranties, setWarranties] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resClaims, resVehicles] = await Promise.all([
          axiosPrivate.get(API_ENDPOINTS.CLAIMS),
          axiosPrivate.get(API_ENDPOINTS.VEHICLES),
        ]);

        const claims = Array.isArray(resClaims.data) ? resClaims.data : [];
        const vehicles = Array.isArray(resVehicles.data) ? resVehicles.data : [];

        const filteredClaims = claims.filter(
          (claim) =>
            claim?.evmId?.toLowerCase() === evmId.toLowerCase() &&
            claim?.status?.toUpperCase() === "DECIDE"
        );

        const enrichedClaims = filteredClaims.map((claim) => {
          const vehicle = vehicles.find((v) => v.vin === claim.vin);
          return {
            ...claim,
            plate: vehicle?.plate || "Unknown",
            vehicleModel: vehicle?.model || "Unknown",
            vehicleType: vehicle?.type || "Unknown",
            customerName: vehicle?.customer?.customerName || "Unknown",
            customerPhone: vehicle?.customer?.customerPhone || "Unknown",
            serviceCenter:
              vehicle?.customer?.serviceCenter?.centerName || "Unknown",
          };
        });
        const sortedClaims = [...enrichedClaims].sort((a, b) => {
          const dateA = new Date(a.claimDate);
          const dateB = new Date(b.claimDate);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA;
          }

          const numA = parseInt(a.claimId?.match(/(\d+)$/)?.[1] || 0, 10);
          const numB = parseInt(b.claimId?.match(/(\d+)$/)?.[1] || 0, 10);
          return numB - numA;
        });

        setWarranties(sortedClaims);
        console.log(
          `[EVMClaim] Loaded ${sortedClaims.length} DECIDE claims for evmId: ${evmId}`
        );
      } catch (err) {
        console.error("[EVMClaim] Fetch failed:", err?.response || err);
      }
    };

    if (evmId) fetchData();
  }, [evmId]);

  const filteredWarranties = warranties.filter((claim) => {
    const matchesSearch =
      (claim.claimId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.plate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.vehicleModel || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (claim.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || claim.status === filterStatus;
    const matchesVehicleModel =
      filterVehicleModel === "all" ||
      (claim.vehicleModel || "") === filterVehicleModel;

    return matchesSearch && matchesStatus && matchesVehicleModel;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWarranties.length / itemsPerPage)
  );
  const paginatedWarranties = filteredWarranties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewWarranty = (warranty) => {
    setSelectedWarranty(warranty);
    setShowWarrantyDetail(true);
  };

  const getStatusBadge = (status) => {
    const map = {
      CHECK: "text-blue-700 border-blue-400",
      REPAIR: "text-amber-700 border-amber-400",
      DECIDE: "text-indigo-700 border-indigo-400",
      HANDOVER: "text-cyan-700 border-cyan-400",
      DONE: "text-green-700 border-green-400",
    };
    const cls = map[status] || "text-gray-700 border-gray-300";
    return (
      <span
        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-medium border bg-transparent min-w-[100px] ${cls}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Warranty Claim Management</h1>

            {/*Bộ lọc*/}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by plate, claim ID or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filterVehicleModel}
                onValueChange={setFilterVehicleModel}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Vehicle Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicle Models</SelectItem>
                  {Array.from(
                    new Set(
                      warranties
                        .map((c) => c.vehicleModel || "")
                        .filter(Boolean)
                    )
                  ).map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="CHECK">CHECK</SelectItem>
                  <SelectItem value="REPAIR">REPAIR</SelectItem>
                  <SelectItem value="DECIDE">DECIDE</SelectItem>
                  <SelectItem value="HANDOVER">HANDOVER</SelectItem>
                  <SelectItem value="DONE">DONE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/*Bảng danh sách*/}
            <div className="w-full overflow-x-auto">
              <Table className="table-fixed w-full border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Claim ID</TableHead>
                    <TableHead className="w-[140px]">Vehicle Plate</TableHead>
                    <TableHead className="w-[160px]">Model</TableHead>
                    <TableHead className="w-[240px]">Description</TableHead>
                    <TableHead className="w-[120px] text-center">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWarranties.map((claim) => (
                    <TableRow
                      key={claim.claimId}
                      onClick={() => handleViewWarranty(claim)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium align-middle">
                        {claim.claimId}
                      </TableCell>
                      <TableCell className="align-middle">{claim.plate}</TableCell>
                      <TableCell className="align-middle">
                        {claim.vehicleModel}
                      </TableCell>
                      <TableCell className="align-middle truncate max-w-[240px]">
                        {claim.description || "—"}
                      </TableCell>
                      <TableCell className="align-middle text-center">
                        {getStatusBadge(claim.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/*Pagination*/}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
  );
}

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
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
import axiosPrivate from "@/api/axios";

const API = {
  CLAIMS: "/api/warranty-claims",
  VEHICLES: "/api/vehicles",
};

const getDefaultDateFrom = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split("T")[0];
};

const getDefaultDateTo = () => new Date().toISOString().split("T")[0];

export default function EVMStaffHistoryWarranty({ auth, onBack }) {
  const evmId = auth?.accountId || auth?.id || "";
  const [claims, setClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom());
  const [dateTo, setDateTo] = useState(getDefaultDateTo());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resClaims = await axiosPrivate.get(API.CLAIMS);
        const claimsData = Array.isArray(resClaims.data) ? resClaims.data : [];

        const userClaims = claimsData.filter(
          (c) => c.evmId?.toUpperCase() === evmId.toUpperCase()
        );

        const enrichedClaims = await Promise.all(
          userClaims.map(async (claim) => {
            try {
              const resVehicle = await axiosPrivate.get(
                `${API.VEHICLES}/${claim.vin}`
              );
              const vehicle = resVehicle.data;
              return {
                ...claim,
                plate: vehicle?.plate || "—",
                vehicleModel: vehicle?.model || "Unknown",
              };
            } catch (err) {
              console.error("Failed to fetch vehicle for VIN:", claim.vin, err);
              return { ...claim, plate: "—", vehicleModel: "Unknown" };
            }
          })
        );

        setClaims(enrichedClaims);
      } catch (err) {
        console.error("Failed to fetch claims:", err);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    if (evmId) fetchData();
  }, [evmId]);

  const filteredClaims = claims
    .filter((claim) => {
      const matchesSearch =
        claim.claimId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.plate?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || claim.status === statusFilter;

      const claimDate = new Date(claim.claimDate);
      const matchesDateFrom = !dateFrom || claimDate >= new Date(dateFrom);
      const matchesDateTo =
        !dateTo || claimDate <= new Date(dateTo + "T23:59:59");

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    })
    .sort((a, b) => {
      const dateA = new Date(a.claimDate);
      const dateB = new Date(b.claimDate);
      if (dateB.getTime() !== dateA.getTime()) return dateB - dateA;
      const serialA = parseInt(a.claimId?.split("-").pop()) || 0;
      const serialB = parseInt(b.claimId?.split("-").pop()) || 0;
      return serialB - serialA;
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClaims.length / itemsPerPage)
  );
  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Button>
      </div>

      {/* Filters Section - Responsive Card */}
      <div className="flex flex-col lg:flex-row gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        {/* Date Range */}
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">
              Date From
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full lg:w-[150px]"
              max={dateTo}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">
              Date To
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full lg:w-[150px]"
              min={dateFrom}
            />
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1 items-end">
          <div className="relative flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-1 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by claim ID or plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="w-full sm:w-[180px]">
            <label className="text-xs text-muted-foreground mb-1 block">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
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
          </div>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <p className="text-center text-muted-foreground py-10">
          Loading claims...
        </p>
      ) : filteredClaims.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg bg-muted/10">
          <p className="text-muted-foreground">
            No claims found for your account.
          </p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Claim ID</TableHead>
                    <TableHead className="w-[120px]">Vehicle Plate</TableHead>
                    <TableHead className="w-[100px]">Model</TableHead>
                    <TableHead className="w-[200px]">Description</TableHead>
                    <TableHead className="w-[120px] text-center">
                      Status
                    </TableHead>
                    <TableHead className="w-[120px] text-center">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClaims.map((claim) => (
                    <TableRow
                      key={claim.claimId}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium align-middle">
                        {claim.claimId}
                      </TableCell>
                      <TableCell className="align-middle">
                        {claim.plate}
                      </TableCell>
                      <TableCell className="align-middle">
                        {claim.vehicleModel}
                      </TableCell>
                      <TableCell
                        className="align-middle truncate max-w-[200px]"
                        title={claim.description}
                      >
                        {claim.description || "—"}
                      </TableCell>
                      <TableCell className="align-middle text-center">
                        {getStatusBadge(claim.status)}
                      </TableCell>
                      <TableCell className="align-middle text-center whitespace-nowrap">
                        {new Date(claim.claimDate).toLocaleDateString("en-GB")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {filteredClaims.length > itemsPerPage && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
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
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

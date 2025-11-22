// FE/src/pages/EVMStaffCostReport.jsx

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  FileText,
  TrendingUp,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EVMStaffSideBar from "@/components/evmstaff/EVMStaffSideBar";
import Header from "@/components/Header";
import axiosPrivate from "@/api/axios";

// --- API ENDPOINTS ---
const CLAIMS_API = "/api/warranty-claims";
const PARTS_API = "/api/parts";

export default function EVMStaffReport() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State dữ liệu
  const [rawClaims, setRawClaims] = useState([]);
  const [rawParts, setRawParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State bộ lọc
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'year'
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear())
  );

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  // Tự động tạo danh sách năm: Từ 2023 đến năm hiện tại + 1 (để dự báo nếu cần)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023; // Năm bắt đầu hệ thống
    const years = [];
    // Tạo mảng từ startYear đến currentYear
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse(); // Đảo ngược để năm mới nhất lên đầu
  }, []);

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi song song 2 API để lấy Claims và Parts (để tính tiền)
      const [claimsRes, partsRes] = await Promise.all([
        axiosPrivate.get(CLAIMS_API),
        axiosPrivate.get(PARTS_API),
      ]);

      setRawClaims(Array.isArray(claimsRes.data) ? claimsRes.data : []);
      setRawParts(Array.isArray(partsRes.data) ? partsRes.data : []);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setError("Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. XỬ LÝ DỮ LIỆU (Tính toán chi phí & Biểu đồ) ---
  const processedData = useMemo(() => {
    if (rawClaims.length === 0 || rawParts.length === 0) {
      return {
        filteredClaims: [],
        chartData: [],
        totalCost: 0,
        totalClaims: 0,
      };
    }

    // A. Tạo Map giá tiền: { "PART-001": 500000, ... }
    const partPriceMap = {};
    const partNameMap = {};
    rawParts.forEach((p) => {
      if (p.partNumber) {
        partPriceMap[p.partNumber] = Number(p.price) || 0;
        partNameMap[p.partNumber] = p.namePart || p.partNumber;
      }
    });

    // B. Tính toán chi phí cho từng Claim
    // Chỉ tính các claim có status là DONE (hoặc trạng thái hoàn thành tương đương) nếu cần thiết.
    // Ở đây tôi tính tất cả claim có trong hệ thống để báo cáo tổng quát.
    const enrichedClaims = rawClaims.map((claim) => {
      const partIds = claim.partNumbers || [];

      // Tổng tiền = Tổng giá của các part trong claim
      const claimCost = partIds.reduce((sum, partId) => {
        return sum + (partPriceMap[partId] || 0);
      }, 0);

      // Lấy tên part đầu tiên để hiển thị đại diện (nếu có)
      const mainPartName =
        partIds.length > 0 ? partNameMap[partIds[0]] : "No parts";
      const partDisplay =
        partIds.length > 1
          ? `${mainPartName} (+${partIds.length - 1})`
          : mainPartName;

      return {
        ...claim,
        computedCost: claimCost,
        displayPart: partDisplay,
        formattedDate: claim.claimDate ? claim.claimDate.split("T")[0] : "",
      };
    });

    // C. Lọc dữ liệu theo View Mode (Tháng/Năm)
    let filtered = [];
    let chartData = [];

    if (viewMode === "month") {
      // --- VIEW THEO THÁNG (Biểu đồ theo Ngày) ---
      filtered = enrichedClaims.filter(
        (c) => c.formattedDate.startsWith(selectedDate) // check YYYY-MM
      );

      // Tạo khung dữ liệu cho tất cả các ngày trong tháng
      const [year, month] = selectedDate.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
        name: `${i + 1}`, // Ngày 1, 2, 3...
        fullDate: `${selectedDate}-${String(i + 1).padStart(2, "0")}`,
        value: 0, // Tổng tiền
        count: 0, // Số lượng claim
      }));

      // Cộng dồn dữ liệu
      filtered.forEach((c) => {
        const day = parseInt(c.formattedDate.split("-")[2]); // Lấy ngày từ YYYY-MM-DD
        if (day >= 1 && day <= daysInMonth) {
          dailyData[day - 1].value += c.computedCost;
          dailyData[day - 1].count += 1;
        }
      });
      chartData = dailyData;
    } else {
      // --- VIEW THEO NĂM (Biểu đồ theo Tháng) ---
      filtered = enrichedClaims.filter(
        (c) => c.formattedDate.startsWith(selectedYear) // check YYYY
      );

      // Tạo khung dữ liệu cho 12 tháng
      const monthlyData = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ].map((m) => ({ name: m, value: 0, count: 0 }));

      // Cộng dồn dữ liệu
      filtered.forEach((c) => {
        const month = parseInt(c.formattedDate.split("-")[1]); // Lấy tháng (01 -> 1)
        if (month >= 1 && month <= 12) {
          monthlyData[month - 1].value += c.computedCost;
          monthlyData[month - 1].count += 1;
        }
      });
      chartData = monthlyData;
    }

    // D. Tính tổng số liệu hiển thị
    const totalCost = filtered.reduce((sum, c) => sum + c.computedCost, 0);
    const totalClaims = filtered.length;

    return { filteredClaims: filtered, chartData, totalCost, totalClaims };
  }, [rawClaims, rawParts, viewMode, selectedDate, selectedYear]);

  // Helper format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <EVMStaffSideBar
        isMobileOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
      />
      <div className="lg:pl-64">
        <Header onMenuClick={handleOpenMenu} />

        <main className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* === HEADER & FILTERS === */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Cost Analysis
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Warranty expenditure report based on part replacement costs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="View Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">By Month</SelectItem>
                  <SelectItem value="year">By Year</SelectItem>
                </SelectContent>
              </Select>

              {viewMode === "month" ? (
                <Input
                  type="month"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[160px]"
                />
              ) : (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={fetchData}
                title="Refresh Data"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Fetching data...
              </span>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
              <Button variant="link" onClick={fetchData} className="ml-2">
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* === SUMMARY CARDS === */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Cost
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(processedData.totalCost)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sum of parts value for selected period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Claims
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {processedData.totalClaims}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Claims with assigned parts
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Cost / Claim
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {processedData.totalClaims > 0
                        ? formatCurrency(
                            processedData.totalCost / processedData.totalClaims
                          )
                        : "0 ₫"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* === CHART === */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Cost Trend</CardTitle>
                  <CardDescription>
                    Breakdown by{" "}
                    {viewMode === "month"
                      ? "day of the month"
                      : "month of the year"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) =>
                            val >= 1000000
                              ? `${(val / 1000000).toFixed(0)}M`
                              : val
                          }
                        />
                        <Tooltip
                          cursor={{ fill: "transparent" }}
                          formatter={(value) => [formatCurrency(value), "Cost"]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="currentColor"
                          radius={[4, 4, 0, 0]}
                          className="fill-primary"
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* === DETAILED TABLE === */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Transactions</CardTitle>
                  <CardDescription>
                    List of claims in this period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Claim ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Parts Involved</TableHead>
                          <TableHead className="text-right">
                            Estimated Cost
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedData.filteredClaims.length > 0 ? (
                          processedData.filteredClaims.map((claim) => (
                            <TableRow key={claim.claimId}>
                              <TableCell className="font-medium">
                                {claim.claimId}
                              </TableCell>
                              <TableCell>{claim.formattedDate}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border">
                                  {claim.status}
                                </span>
                              </TableCell>
                              <TableCell
                                className="max-w-[250px] truncate"
                                title={claim.partNumbers?.join(", ")}
                              >
                                {claim.displayPart}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(claim.computedCost)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center h-24 text-muted-foreground"
                            >
                              No data available for this period.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

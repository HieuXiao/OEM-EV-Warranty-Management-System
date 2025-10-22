import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Search,
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import EVMStaffSideBar from "../components/evmstaff/EVMStaffSideBar";
import Header from "../components/Header";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { mockPartsInventory } from "../lib/Mock-data";

export default function EVMStaffReportAnalysis() {
  const mockBranchStats = [
    { id: "001", branch: "Ha Noi", totalWarranty: 427, totalPart: 1574 },
    { id: "002", branch: "Ho Chi Minh", totalWarranty: 392, totalPart: 1890 },
    { id: "003", branch: "Da Nang", totalWarranty: 284, totalPart: 972 },
    { id: "004", branch: "Hai Phong", totalWarranty: 319, totalPart: 1341 },
    { id: "005", branch: "Can Tho", totalWarranty: 188, totalPart: 1102 },
    { id: "006", branch: "Bac Ninh", totalWarranty: 256, totalPart: 987 },
    { id: "007", branch: "Hung Yen", totalWarranty: 361, totalPart: 1460 },
    { id: "008", branch: "Hai Duong", totalWarranty: 274, totalPart: 1211 },
    { id: "009", branch: "Nam Dinh", totalWarranty: 146, totalPart: 1165 },
    { id: "010", branch: "Thai Binh", totalWarranty: 198, totalPart: 1040 },
    { id: "011", branch: "Thanh Hoa", totalWarranty: 342, totalPart: 1389 },
    { id: "012", branch: "Nghe An", totalWarranty: 376, totalPart: 1288 },
    { id: "013", branch: "Ha Tinh", totalWarranty: 203, totalPart: 935 },
    { id: "014", branch: "Quang Binh", totalWarranty: 118, totalPart: 845 },
    { id: "015", branch: "Quang Tri", totalWarranty: 97, totalPart: 670 },
    { id: "016", branch: "Hue", totalWarranty: 211, totalPart: 1132 },
    { id: "017", branch: "Quang Nam", totalWarranty: 178, totalPart: 1254 },
    { id: "018", branch: "Quang Ngai", totalWarranty: 204, totalPart: 952 },
    { id: "019", branch: "Binh Dinh", totalWarranty: 275, totalPart: 1173 },
    { id: "020", branch: "Phu Yen", totalWarranty: 169, totalPart: 821 },
    { id: "021", branch: "Khanh Hoa", totalWarranty: 334, totalPart: 1467 },
    { id: "022", branch: "Ninh Thuan", totalWarranty: 112, totalPart: 743 },
    { id: "023", branch: "Binh Thuan", totalWarranty: 184, totalPart: 890 },
    { id: "024", branch: "Lam Dong", totalWarranty: 246, totalPart: 1021 },
    { id: "025", branch: "Dak Lak", totalWarranty: 215, totalPart: 934 },
    { id: "026", branch: "Gia Lai", totalWarranty: 144, totalPart: 774 },
    { id: "027", branch: "Kon Tum", totalWarranty: 85, totalPart: 602 },
    { id: "028", branch: "Binh Duong", totalWarranty: 402, totalPart: 1759 },
    { id: "029", branch: "Dong Nai", totalWarranty: 355, totalPart: 1684 },
    {
      id: "030",
      branch: "Ba Ria - Vung Tau",
      totalWarranty: 229,
      totalPart: 1078,
    },
    { id: "031", branch: "Long An", totalWarranty: 183, totalPart: 955 },
    { id: "032", branch: "Tien Giang", totalWarranty: 166, totalPart: 812 },
    { id: "033", branch: "An Giang", totalWarranty: 132, totalPart: 765 },
    { id: "034", branch: "Kien Giang", totalWarranty: 191, totalPart: 980 },
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  };

  const filteredBranchs = mockBranchStats.filter((branch) =>
    branch.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalParts = mockPartsInventory.length;
  const totalStock = mockPartsInventory.reduce(
    (sum, part) => sum + part.stock,
    0
  );
  const totalValue = mockPartsInventory.reduce(
    (sum, part) => sum + part.price * part.stock,
    0
  );
  const lowStockItems = mockPartsInventory.filter(
    (part) => part.remain < 5
  ).length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Tính toán dữ liệu hiển thị theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBranchs.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredBranchs.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar image={user.image} name={user.name} role={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header name={user.name} email={user.email} image={user.image} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Reporting & Analysis</h1>

            <Tabs defaultValue="statistics" className="space-y-6">
              <TabsList>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
                <TabsTrigger value="ai">AI Analytics</TabsTrigger>
              </TabsList>

              {/* Statistics Tab */}
              <TabsContent value="statistics" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Parts
                      </CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalParts}</div>
                      <p className="text-xs text-muted-foreground">
                        Active inventory items
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Stock
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalStock}</div>
                      <p className="text-xs text-muted-foreground">
                        Units in stock
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Value
                      </CardTitle>
                      VND
                      {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(totalValue)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Inventory value
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Low Stock Alert
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">
                        {lowStockItems}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Items need restock
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Parts Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
              <TableHead>No.</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Total Warranty</TableHead>
                <TableHead>Total Part</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((item, i) => (
                        <TableRow key={item.id} onClick={() => navigate(`${item.id}`)} className="group cursor-pointer hover:bg-blue-50 active:bg-blue-100">
                          <TableCell className="bg-transparent group-hover:bg-transparent group-active:bg-transparent">{i + 1}</TableCell>
                          <TableCell>{item.branch}</TableCell>
                          <TableCell>{item.totalWarranty}</TableCell>
                          <TableCell>{item.totalPart}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}

                <div className="flex items-center justify-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-5" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-5" />
                  </Button>
                </div>
              </TabsContent>

              {/* AI Analytics Tab */}
              <TabsContent value="ai" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Powered Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <div className="text-center space-y-2">
                        <BarChart3 className="h-12 w-12 mx-auto" />
                        <p>AI Analytics Coming Soon</p>
                        <p className="text-sm">
                          Advanced predictive analytics and insights
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

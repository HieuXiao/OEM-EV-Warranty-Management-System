import EVMStaffSideBar from "./EVMStaffSideBar";
import Header from "../Header";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "../ui/input";
import { mockWarehousesInventory } from "@/lib/Mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function EVMStaffWarehouseDetail() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  };

  const warehouseDetail = mockWarehousesInventory.find((c) => c.id === id);

  const filteredInventory = warehouseDetail.parts.filter((i) => {
    const matchesSearch = i.partName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getLowStockAlert = (part) => {
    return part.total <= 10 ? "Low" : "Normal";
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    const map = {
      normal: "text-green-400 border-green-400",
      low: "text-red-800 border-red-700",
    };
    const cls = map[s] || "text-gray-700 border-gray-300";
    return (
      <span
        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-medium border bg-transparent min-w-[100px] ${cls}`}
      >
        {String(status || "").replace(/_/g, " ")}
      </span>
    );
  };

  // Set format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar image={user.image} name={user.name} role={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header name={user.name} email={user.email} image={user.image} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{warehouseDetail.name}</h1>
            </div>

            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

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
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead className="text-center">Part</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="text-center">
                        {item.partName}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.total}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(item.lastUpdate).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(getLowStockAlert(item))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

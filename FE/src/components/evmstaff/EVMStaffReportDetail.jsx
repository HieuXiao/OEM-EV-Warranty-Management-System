import EVMStaffSideBar from "./EVMStaffSideBar";
import Header from "../Header";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "../ui/input";
import { mockBranchStats } from "@/lib/Mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function EVMStaffReportDetail() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  };

  const branchDetail = mockBranchStats.find((c) => c.id === id);

  const filteredParts = branchDetail.parts.filter((p) => {
    const matchesSearch = p.partName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
              <h1 className="text-3xl font-bold">
                Branch {branchDetail.branch}
              </h1>
            </div>

            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map((part, i) => (
                    <TableRow key={part.partName}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{part.partName}</TableCell>
                      <TableCell>{part.total}</TableCell>
                      <TableCell>
                        {formatCurrency(part.total * part.unitPrice)}
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

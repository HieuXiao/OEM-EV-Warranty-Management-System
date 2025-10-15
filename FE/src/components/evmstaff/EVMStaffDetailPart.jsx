import EVMStaffSideBar from "./EVMStaffSideBar";
import Header from "../Header";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Label } from "../ui/label";

export default function EVMStaffDetailPart() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Sample Data
  const mockAttachHistory = [
    {
      id: "1",
      history: [
        {
          serial: `BAT-VF8-${Math.floor(Math.random() * 900) + 100}`,
          vin: "VN-CAR-001",
          branch: "Hanoi Central",
          date: "2025-10-10",
        },
        {
          serial: `BAT-VF8-${Math.floor(Math.random() * 900) + 100}`,
          vin: "VN-CAR-004",
          branch: "Hanoi Central",
          date: "2025-10-14",
        },
      ],
    },
    {
      id: "2",
      history: [
        {
          serial: `INF-VF-${Math.floor(Math.random() * 900) + 100}`,
          vin: "VN-CAR-015",
          branch: "HCMC District 1",
          date: "2025-10-11",
        },
        {
          serial: `INF-VF-${Math.floor(Math.random() * 900) + 100}`,
          vin: "VN-CAR-036",
          branch: "HCMC District 1",
          date: "2025-10-15",
        },
      ],
    },
    {
      id: "3",
      history: [
        {
          serial: `BRK-VF-${Math.floor(Math.random() * 900) + 100}`,
          vin: "VN-CAR-020",
          branch: "Da Nang",
          date: "2025-10-09",
        },
        {
          serial: `BRK-VF-${Math.floor(Math.random() * 900) + 100}`,
          vin: "VN-CAR-045",
          branch: "Da Nang",
          date: "2025-10-13",
        },
      ],
    },
    {
      id: "4",

      history: [
        {
          serial: `MOT-VF9-${Math.floor(Math.random() * 900) + 100}`,
          vin: "VN-CAR-071",
          branch: "Hanoi Central",
          date: "2025-10-08",
        },
      ],
    },
    {
      id: "5",
      history: [
        {
          serial: `CHA-VF-${Math.floor(Math.random() * 900) + 100}`,
          vin: "VN-CAR-079",
          branch: "HCMC District 1",
          date: "2025-10-12",
        },
        {
          serial: `CHA-VF-${Math.floor(Math.random() * 900) + 100}`,
          vin: "VN-CAR-112",
          branch: "HCMC District 1",
          date: "2025-10-15",
        },
      ],
    },
  ];

  const attachHistory = mockAttachHistory.find((c) => c.id === id);

  const filteredAttachHistoty = attachHistory.history.filter((h) => {
    const matchesSearch =
      h.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.serial.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  };
  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar image={user.image} name={user.name} role={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header name={user.name} email={user.email} image={user.image} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Attach History</h1>
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
                className="pl-10 w-md"
              />
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>.No</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttachHistoty?.length ? (
                    filteredAttachHistoty.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{item.serial}</TableCell>
                        <TableCell>{item.vin}</TableCell>
                        <TableCell>{item.branch}</TableCell>
                        <TableCell>{item.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500 py-4"
                      >
                        ⚠️ No attach item found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

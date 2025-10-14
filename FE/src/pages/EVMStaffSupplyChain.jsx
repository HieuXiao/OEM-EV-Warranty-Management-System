
import { useState } from "react"
import { Search, Filter, Plus, AlertTriangle } from "lucide-react";
import EVMStaffSideBar from "../components/evmstaff/EVMStaffSideBar";
import Header from "../components/Header";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { mockSupplyChain } from "../lib/Mock-data";

export default function EVMStaffSupplyChain() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAlert, setFilterAlert] = useState("all")

  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  }

  const filteredSupplyChain = mockSupplyChain.filter((item) => {
    const matchesSearch = item.partName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAlert = filterAlert === "all" || item.alert === filterAlert
    return matchesSearch && matchesAlert
  })

  const getAlertBadge = (alert) => {
    const variants = {
      normal: "bg-green-500",
      low: "bg-yellow-500",
      critical: "bg-red-500",
    }
    return (
      <Badge className={variants[alert]}>
        {alert === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
        {alert.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar image={user.image} name={user.name} role={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header name={user.name} email={user.email} image={user.image} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Supply Chain</h1>
            </div>

            {/* Search and Filter */}
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
              <Select value={filterAlert} onValueChange={setFilterAlert}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>

            {/* Supply Chain Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Remain</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Detail</TableHead>
                    <TableHead>Detail</TableHead>
                    <TableHead>Alert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSupplyChain.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.partName}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{item.remain}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell>{getAlertBadge(item.alert)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <span className="text-sm">
                {filteredSupplyChain.length} / {mockSupplyChain.length}
              </span>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

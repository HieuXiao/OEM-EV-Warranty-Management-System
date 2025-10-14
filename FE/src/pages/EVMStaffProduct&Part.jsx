
import { useState } from "react";
import { Search, Filter, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import EVMStaffSideBar from "../components/evmstaff/EVMStaffSideBar";
import Header from "../components/Header";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import EVMStaffFormNewPart from "../components/evmstaff/EVMStaffFormNewPart";
import { mockPartsInventory } from "../lib/Mock-data";

export default function EVMStaffProductPart() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBranch, setFilterBranch] = useState("all")
  const [showNewPartDialog, setShowNewPartDialog] = useState(false)
  const [parts, setParts] = useState(mockPartsInventory)

  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  }

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.serial.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = filterBranch === "all" || part.branch === filterBranch
    return matchesSearch && matchesBranch
  })

  const handleSaveNewPart = (newPart) => {
    setParts([
      ...parts,
      {
        id: String(parts.length + 1),
        ...newPart,
        stock: 0,
        remain: 0,
        location: "Pending Assignment",
        vehicleModels: newPart.vehicleType.split(",").map((v) => v.trim()),
      },
    ])
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  return (
    <div className="flex h-screen bg-background">
      <EVMStaffSideBar image={user.image} name={user.name} role={user.role} />
      <div className="flex-1 flex flex-col ml-64">
        <Header name={user.name} email={user.email} image={user.image} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Products & Parts</h1>
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
              <Select value={filterBranch} onValueChange={setFilterBranch}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Hanoi Central">Hanoi Central</SelectItem>
                  <SelectItem value="HCMC District 1">HCMC District 1</SelectItem>
                  <SelectItem value="Da Nang">Da Nang</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowNewPartDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Parts
              </Button>
            </div>

            {/* Parts Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial</TableHead>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Attach</TableHead>
                    <TableHead>Update</TableHead>
                    <TableHead>Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.serial}</TableCell>
                      <TableCell>{part.partName}</TableCell>
                      <TableCell className="max-w-xs truncate">{part.description}</TableCell>
                      <TableCell>{formatCurrency(part.price)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
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
                {filteredParts.length} / {parts.length}
              </span>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </main>
      </div>

      <EVMStaffFormNewPart open={showNewPartDialog} onOpenChange={setShowNewPartDialog} onSave={handleSaveNewPart} />
    </div>
  )
}

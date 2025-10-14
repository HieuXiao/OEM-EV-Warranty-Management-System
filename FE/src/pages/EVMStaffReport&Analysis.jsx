
import { useState } from "react";
import { Search, BarChart3, TrendingUp, Package, DollarSign } from "lucide-react";
import EVMStaffSideBar from "../components/evmstaff/EVMStaffSideBar";
import Header from "../components/Header";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { mockPartsInventory } from "../lib/Mock-data";

export default function EVMStaffReportAnalysis() {
  const [searchTerm, setSearchTerm] = useState("")

  const user = {
    name: "Mage Team",
    email: "evmstaff@evwarranty.com",
    role: "EVM Staff",
    image: "/diverse-professional-team.png",
  }

  const filteredParts = mockPartsInventory.filter((part) =>
    part.partName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalParts = mockPartsInventory.length
  const totalStock = mockPartsInventory.reduce((sum, part) => sum + part.stock, 0)
  const totalValue = mockPartsInventory.reduce((sum, part) => sum + part.price * part.stock, 0)
  const lowStockItems = mockPartsInventory.filter((part) => part.remain < 5).length

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
                      <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalParts}</div>
                      <p className="text-xs text-muted-foreground">Active inventory items</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalStock}</div>
                      <p className="text-xs text-muted-foreground">Units in stock</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                      <p className="text-xs text-muted-foreground">Inventory value</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">{lowStockItems}</div>
                      <p className="text-xs text-muted-foreground">Items need restock</p>
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
                        <TableHead>ID</TableHead>
                        <TableHead>Part Name</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Part Specifications</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Detail</TableHead>
                        <TableHead>Update</TableHead>
                        <TableHead>Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.serial}</TableCell>
                          <TableCell>{part.partName}</TableCell>
                          <TableCell>{part.branch}</TableCell>
                          <TableCell className="max-w-xs truncate">{part.specifications}</TableCell>
                          <TableCell>{formatCurrency(part.price)}</TableCell>
                          <TableCell>
                            <button className="text-blue-500 hover:underline">View</button>
                          </TableCell>
                          <TableCell>
                            <button className="text-blue-500 hover:underline">Edit</button>
                          </TableCell>
                          <TableCell>
                            <button className="text-red-500 hover:underline">Delete</button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                        <p className="text-sm">Advanced predictive analytics and insights</p>
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
  )
}

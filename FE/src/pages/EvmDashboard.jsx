import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Clock, Package, ArrowUpRight, AlertTriangle } from "lucide-react"
import { mockWarrantyClaims, mockPartsInventory } from "@/lib/Mock-warranty-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EVMSidebar from "@/components/EvmSidebar"

export default function EvmDashboard() {
  const [claims] = useState(mockWarrantyClaims)
  const [parts] = useState(mockPartsInventory)

  // Calculate stats
  const totalClaims = claims.length
  const pendingClaims = claims.filter((c) => c.status === "pending").length
  const inProgressClaims = claims.filter((c) => c.status === "in_progress").length
  const totalParts = parts.reduce((sum, part) => sum + part.stock, 0)
  const lowStockParts = parts.filter((p) => p.stock < p.minStock).length

  function getStatusColor(status) {
    switch (status) {
      case "in_progress":
        return "bg-blue-500 text-white"
      case "pending":
        return "bg-yellow-500 text-white"
      case "approved":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "in_progress":
        return "in progress"
      case "pending":
        return "pending"
      case "approved":
        return "approved"
      default:
        return status
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-orange-500 text-white"
      case "low":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <EVMSidebar name="Nguyen Van A" image="/placeholder-user.jpg" role="EVM Staff" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EV Warranty</h1>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </Button>
              <div className="flex items-center gap-3">
                <img src="/placeholder-user.jpg" alt="Nguyen Van A" className="h-9 w-9 rounded-full object-cover" />
                <span className="text-sm font-medium">Nguyen Van A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content - Fixed height to prevent scrolling */}
        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Claims</CardTitle>
                  <Shield className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalClaims}</div>
                  <p className="text-xs text-orange-500 mt-1">{pendingClaims} pending</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
                  <Clock className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{inProgressClaims}</div>
                  <p className="text-xs text-gray-500 mt-1">Active warranty claims</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Parts Inventory</CardTitle>
                  <Package className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalParts}</div>
                  <p className="text-xs text-red-500 mt-1">{lowStockParts} low stock</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
              {/* Recent Warranty Claims */}
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Warranty Claims</CardTitle>
                      <CardDescription className="mt-1">Latest claims requiring attention</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View all
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-base">{claim.id}</h3>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(claim.status)}>{getStatusLabel(claim.status)}</Badge>
                          <Badge className={getPriorityColor(claim.priority)}>{claim.priority}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {claim.vehicleModel} - {claim.vin}
                      </p>
                      <p className="text-sm text-gray-500">{claim.issue}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Parts Inventory Status */}
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Parts Inventory Status</CardTitle>
                      <CardDescription className="mt-1">Current stock levels</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View all
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto space-y-4">
                  {parts.map((part) => (
                    <div key={part.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1">{part.name}</h3>
                          <p className="text-sm text-gray-500">{part.code}</p>
                        </div>
                        <Badge className={part.status === "low" ? "bg-red-500 text-white" : "bg-gray-800 text-white"}>
                          {part.stock} units
                        </Badge>
                      </div>
                      {part.status === "low" && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Low stock alert</span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

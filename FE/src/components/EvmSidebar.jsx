"use client"

import { Car, Shield, BarChart3, Link2, LayoutDashboard, Phone, BookOpen } from "lucide-react"
import { Button } from "./ui/button"
import UserInfo from "./UserInfo"
import NavigationItem from "./NavigationItem"
import Logo from "./Logo"

export default function EVMSidebar({ image, name, role }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 -translate-x-full">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <Logo />

        {/* User Info */}
        <UserInfo image={image} name={name} role={role} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Dashboard */}
          <NavigationItem icon={LayoutDashboard} funcName="Dashboard" path="/dashboard" />

          {/* Products & Parts - Expandable */}
          <NavigationItem
            icon={Car}
            funcName="Products & Parts"
            defaultExpanded={true}
            subItems={[
              { name: "EV Parts Data", active: true },
              { name: "Attach Part", active: false },
              { name: "Warranty Policy", active: false },
            ]}
          />

          {/* Warranty Claim - Expandable */}
          <NavigationItem
            icon={Shield}
            funcName="Warranty claim"
            subItems={[
              { name: "Manage warranty", active: false },
              { name: "Manage cost warranty", active: false },
              { name: "Manage campaign service", active: false },
            ]}
          />

          {/* Reporting & Analysis - Expandable */}
          <NavigationItem
            icon={BarChart3}
            funcName="Reporting & Analysis"
            subItems={[
              { name: "Statistics", active: false },
              { name: "AI analytics", active: false },
            ]}
          />

          {/* Supply chain */}
          <NavigationItem icon={Link2} funcName="Supply chain" path="/supply-chain" />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-cyan-500 text-white hover:bg-cyan-600 hover:text-white border-cyan-500"
          >
            <Phone className="h-4 w-4" />
            1900150xxx
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-cyan-500 text-white hover:bg-cyan-600 hover:text-white border-cyan-500"
          >
            <BookOpen className="h-4 w-4" />
            Guide
          </Button>
        </div>
      </div>
    </aside>
  )
}

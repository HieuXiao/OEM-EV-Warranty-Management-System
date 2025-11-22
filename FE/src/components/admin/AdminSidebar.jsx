//  FE/src/components/admin/AdminSidebar.jsx

import {
  Users,
  BookOpen,
  Warehouse,
  Settings,
  Package,
  Building2,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import UserInfo from "../UserInfo";
import NavigationItem from "../NavigationItem";
import Logo from "../Logo";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AdminSidebar({ isMobileOpen, onClose }) {
  useEffect(() => {
    document.title = "Admin Page";
  }, []);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border h-16">
          {/* Logo */}
          <Logo />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose} // <-- SỬ DỤNG PROP onClose
            className="lg:hidden" // Chỉ hiển thị trên màn hình nhỏ
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* User Info */}
        <UserInfo />
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavigationItem
            path={"/admin/users"}
            icon={Users}
            funcName={"User Management"}
          />
          <NavigationItem
            path={"/admin/service-centers"}
            icon={Building2}
            funcName={"Service Center"}
          />
          <NavigationItem
            path={"/admin/warehouses"}
            icon={Warehouse}
            funcName={"Warehouse Area"}
          />
          <NavigationItem
            path={"/admin/parts-policy"}
            icon={Package}
            funcName={"Parts & Policy"}
          />
        </nav>
        {/* Footer */}
        {/* <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <BookOpen className="h-4 w-4" />
            Guide
          </Button>
        </div> */}
      </div>
    </aside>
  );
}

import { Users, BookOpen, Warehouse, Settings } from "lucide-react";
import { Button } from "./ui/button";
import UserInfo from "./UserInfo";
import NavigationItem from "./NavigationItem";
import Logo from "./Logo";

export default function AdminSidebar({ image, name, role }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 -translate-x-full">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <Logo />
        {/* User Info */}
        <UserInfo image={image} name={name} role={role} />
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavigationItem
            path={"/admin/users"}
            icon={Users}
            funcName={"User Management"}
          />
          <NavigationItem
            path={"/admin/warehouse"}
            icon={Warehouse}
            funcName={"Warehouse Area"}
          />
          <NavigationItem
            path={"/admin/setting"}
            icon={Settings}
            funcName={"Setting"}
          />
        </nav>
        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <BookOpen className="h-4 w-4" />
            Guide
          </Button>
        </div>
      </div>
    </aside>
  );
}

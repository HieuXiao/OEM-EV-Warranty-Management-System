import {
  Car,
  BarChart3,
  Warehouse,
  BookOpen,
  Phone,
  Shield,
  TriangleAlert,
} from "lucide-react";
import { Button } from "../ui/button";
import UserInfo from "../UserInfo";
import NavigationItem from "../NavigationItem";
import Logo from "../Logo";
import { useEffect } from "react";

export default function EVMStaffSideBar() {
  useEffect(() => {
    document.title = "EVM Staff Page";
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 -translate-x-full">
      <div className="flex flex-col h-full">
        <Logo />
        <UserInfo />
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavigationItem
            path={"/evmstaff/products"}
            icon={Car}
            funcName={"Products & Parts"}
          />
          <NavigationItem
            path={"/evmstaff/warranty"}
            icon={Shield}
            funcName={"Warranty Claim"}
          />
          <NavigationItem
            path={"/evmstaff/reports"}
            icon={BarChart3}
            funcName={"Reporting & Analysis"}
          />
          <NavigationItem
            path={"/evmstaff/warehouse"}
            icon={Warehouse}
            funcName={"Warehouse"}
          />
          <NavigationItem
            path={"/evmstaff/campaign"}
            icon={TriangleAlert}
            funcName={"Campaign"}
          />
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <Phone className="h-4 w-4" />
            1900150xxx
          </Button>
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Settings, Menu, LogOut } from "lucide-react";
import { clearAuth } from "@/lib/auth";
import useAuth from "@/hook/useAuth";
import { useNavigate } from "react-router-dom";

export default function Header({ onMenuClick }) {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    setAuth({});
    navigate("/");
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-card border-b border-border">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <span className="text-sm font-medium">{auth.fullName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{auth.fullName}</p>
                <p className="text-xs text-muted-foreground">{auth.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={goToProfile}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

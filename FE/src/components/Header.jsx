import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { clearAuth } from "@/lib/auth";
import useAuth from "@/hook/useAuth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    setAuth({});
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-card border-b border-border">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              {/* <Avatar className="h-8 w-8">
                <AvatarImage src={image} />
              </Avatar> */}
              <span className="hidden sm:inline text-sm font-medium">
                {auth.fullName}
              </span>
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
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

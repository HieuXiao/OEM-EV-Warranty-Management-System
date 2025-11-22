
import { cn } from "@/lib/utils";
import useAuth from "@/hook/useAuth";

export default function UserInfo() {
  const { auth } = useAuth();

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {auth.fullName} {/* {user.name} */}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {auth.role.toLowerCase()} {/* {getRoleLabel(user.role)} */}
          </p>
        </div>
      </div>
    </div>
  );
}

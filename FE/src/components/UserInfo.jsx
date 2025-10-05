import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function UserInfo({ image, name, role }) {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={image} />
          <AvatarFallback className={cn("text-white")}></AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {name} {/* {user.name} */}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {role} {/* {getRoleLabel(user.role)} */}
          </p>
        </div>
      </div>
    </div>
  );
}

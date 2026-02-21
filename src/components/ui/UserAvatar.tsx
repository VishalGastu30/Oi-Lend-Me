"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null | undefined;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ user, className, fallbackClassName }: UserAvatarProps) {
  const seed = user?.id || "default";
  const avatarUrl = user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  const initials = user?.name 
    ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() 
    : "?";

  return (
    <Avatar className={cn("relative overflow-hidden", className)}>
      <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
      <AvatarFallback className={cn("bg-gray-800 text-gray-400", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

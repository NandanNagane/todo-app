import * as React from "react";
import {
  ChevronDown,
  LogOut,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = React.useState(false);

  const dropdownActions = [
    {
      id: "logout",
      label: "Log out",
      icon: LogOut,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      
      // Clear all queries from cache
      queryClient.clear();
      
      // Redirect to login page after successful logout
      navigate("/auth/login");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  if (!user) {
    return null; // or a loading skeleton
  }

  // ⭐ Get initials as fallback
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user.userName) {
      return user.userName[0].toUpperCase();
    }
    return "U";
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit px-1.5">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-7 items-center justify-center rounded-xl overflow-hidden">
                {user.profilePictureUrl && !imageError ? (
                  <img 
                    src={user.profilePictureUrl} 
                    alt={user.userName || "User"}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    referrerPolicy="no-referrer"  // ⭐ Important for Google images
                  />
                ) : (
                  <span className="text-xs font-semibold">
                    {getInitials()}
                  </span>
                )}
              </div>
              <span className="truncate font-medium">{user.firstName || user.userName}</span>
              <ChevronDown className="opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {dropdownActions.map((action) => {
              const Icon = action.icon;

              if (action.isFooter) {
                return null;
              }

              return (
                <DropdownMenuItem 
                  key={action.id} 
                  className="gap-2 py-2 px-3"
                  onClick={action.id === "logout" ? handleLogout : undefined}
                >
                  {Icon && <Icon className="size-4 shrink-0" />}
                  <span>{action.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

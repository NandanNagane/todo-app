import * as React from "react";
import {
  ActivityIcon,
  ChevronDown,
  FolderSync,
  GiftIcon,
  LogOut,
  Plus,
  PlusIcon,
  PrinterIcon,
  RefreshCw,
  SettingsIcon,
  Star,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { userQueryAtom } from "@/src/store/atoms/userQueryAtom";
import { useAtom, useAtomValue } from "jotai";

export function Profile() {
  const { data: user } = useAtomValue(userQueryAtom);

  const dropdownActions = [
    // Section 2: Main Actions
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      shortcut: "O then S",
    },
    {
      id: "add-team",
      label: "Add a team",
      icon: PlusIcon,
    },

    // Section 3: More Actions
    {
      id: "activity-log",
      label: "Activity log",
      icon: ActivityIcon,
      shortcut: "G then A",
    },
    {
      id: "print",
      label: "Print",
      icon: PrinterIcon,
      shortcut: "Ctrl P",
    },
    {
      id: "whats-new",
      label: "What's new",
      icon: GiftIcon,
    },

    // Section 4: Upgrade
    {
      id: "upgrade",
      label: "Upgrade to Pro",
      icon: Star,
    },

    // Section 5: Sync & Logout
    {
      id: "sync",
      label: "Sync",
      subtitle: "45 minutes ago",
      icon: RefreshCw,
    },
    {
      id: "logout",
      label: "Log out",
      icon: LogOut,
    },

    // Section 6: Footer Info
    {
      id: "version-info",
      label: "v8655",
      isFooter: true, // Custom property to style it differently
    },
    {
      id: "changelog",
      label: "Changelog",
      isFooter: true,
    },
  ];

  if (!user) {
    return null; // or a loading skeleton
  }

  

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit px-1.5">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-7 items-center justify-center rounded-xl overflow-hidden">
                <img src={user.profilePictureUrl} />
              </div>
              <span className="truncate font-medium"> {user.firstName}</span>
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
              // 1. Assign the component to a capitalized variable.
              const Icon = action.icon;

              // 2. Conditionally render the item. The footer items have a different structure.
              if (action.isFooter) {
                return null; // We'll handle footer items separately if needed
              }

              return (
                <DropdownMenuItem key={action.id} className="gap-2 py-2 px-3">
                  {/* Render the icon only if it exists */}
                  {Icon && <Icon className="size-4 shrink-0 " />}

                  <span>{action.label}</span>
                  {/* Render the subtitle or shortcut */}
                  {action.subtitle ? (
                    <span className="text-muted-foreground ml-auto text-xs">
                      {action.subtitle}
                    </span>
                  ) : (
                    <DropdownMenuShortcut>
                      {action.shortcut}
                    </DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

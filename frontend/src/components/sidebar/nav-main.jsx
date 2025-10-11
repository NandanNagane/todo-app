"use client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { SearchDialog } from "@/components/dialogs/SearchDialog";

export function NavMain({ items }) {
  const { actionButtons, navMain } = items;

  const renderActionButton = (item) => {
    if (item.title === "Add task") {
      return (
        <AddTaskDialog>
          <SidebarMenuButton asChild isActive={item.isActive || false}>
            <button>
              <item.icon />
              <span>{item.title}</span>
              {item.badge && (
                <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
              )}
            </button>
          </SidebarMenuButton>
        </AddTaskDialog>
      );
    }

    if (item.title === "Search") {
      return (
        <SearchDialog>
          <SidebarMenuButton asChild isActive={item.isActive || false}>
            <button>
              <item.icon />
              <span>{item.title}</span>
              {item.badge && (
                <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
              )}
            </button>
          </SidebarMenuButton>
        </SearchDialog>
      );
    }

    // Default fallback
    return (
      <SidebarMenuButton asChild isActive={item.isActive || false}>
        <button>
          <item.icon />
          <span>{item.title}</span>
          {item.badge && (
            <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
          )}
        </button>
      </SidebarMenuButton>
    );
  };

  return (
    <SidebarMenu>
      {actionButtons.map((item) => (
        <SidebarMenuItem key={item.title}>
          {renderActionButton(item)}
        </SidebarMenuItem>
      ))}
      {navMain.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            <a href={item.url}>
              <item.icon />
              <span>{item.title}</span>
              {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

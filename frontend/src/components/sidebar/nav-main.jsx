"use client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";

export function NavMain({ items }) {
  const { actionButtons, navMain } = items;


  return (
    <SidebarMenu>
      {actionButtons.map((item) => (
        <SidebarMenuItem key={item.title}>
          <AddTaskDialog>
            <SidebarMenuButton asChild isActive={item.isActive  || false}>
              <button href={item.url}>
                <item.icon />
                <span>{item.title}</span>
                {item.badge && (
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                )}
              </button>
            </SidebarMenuButton>
          </AddTaskDialog>
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

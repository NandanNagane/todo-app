import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  StarOff,
  Trash2,
  Hash,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";

export function NavFavorites({ myProjects }) {
  const { isMobile } = useSidebar();

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger>
            My Projects
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu>
            {myProjects.map((item) => (
              <SidebarMenuItem className='group/menu-item' key={item.name} >
                <SidebarMenuButton asChild  >
                <a href={item.url} title={item.name}>
                  <Hash className="size-4" />
                  <span>{item.name}</span>
                  {item.emoji && <span className="ml-1">{item.emoji}</span>}
                  {item.badge && (
                    <SidebarMenuBadge className='group-hover/menu-item:hidden'>{item.badge}</SidebarMenuBadge>
                  )}
                </a>
              </SidebarMenuButton >
              <DropdownMenu  >
                <DropdownMenuTrigger asChild  className='cursor-pointer  data-[state=open]:bg-sidebar-accent' >
                  <SidebarMenuAction showOnHover={true} className='rounded px-2' >
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <StarOff className="text-muted-foreground" />
                    <span>Remove from Favorites</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link className="text-muted-foreground" />
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ArrowUpRight className="text-muted-foreground" />
                    <span>Open in New Tab</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
          </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

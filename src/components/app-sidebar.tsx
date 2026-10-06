import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { FilePlusIcon, FilesIcon } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <span className="px-3 py-2 text-lg font-semibold tracking-tight">
          Zalex Certificates
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton type="button">
                  <FilePlusIcon aria-hidden="true" />
                  <span>Request Certificate</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton type="button">
                  <FilesIcon aria-hidden="true" />
                  <span>List Certificate</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <DarkModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}

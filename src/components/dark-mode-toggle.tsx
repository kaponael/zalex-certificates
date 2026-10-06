"use client"

import { useEffect } from "react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { MoonIcon, SunIcon } from "lucide-react"

// Checks localStorage first for theme, if savedTheme equals dark,
// then set darkMode to true, else check if the user prefers dark mode and set darkMode accordingly.
export function DarkModeToggle() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    let darkMode

    if (savedTheme) {
      darkMode = savedTheme === "dark"
    } else {
      darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    // SET the starting theme
    document.documentElement.classList.toggle("dark", darkMode)
  }, [])

  function toggleDarkMode() {
    // FLIP the current theme
    const isDarkMode = document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          type="button"
          onClick={toggleDarkMode}
        >
          <MoonIcon className="dark:hidden" aria-hidden="true" />
          <SunIcon className="hidden dark:block" aria-hidden="true" />
          <span className="dark:hidden">Dark mode</span>
          <span className="hidden dark:inline">Light mode</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

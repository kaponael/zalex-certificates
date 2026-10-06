"use client"

import { useEffect, useState } from "react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { MoonIcon, SunIcon } from "lucide-react"

export function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    let darkMode = false

    if (savedTheme) {
      darkMode = savedTheme === "dark"
    } else {
      darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    }

    document.documentElement.classList.toggle("dark", darkMode)
    setIsDarkMode(darkMode)
  }, [])

  function toggleDarkMode() {
    const newDarkMode = !isDarkMode

    document.documentElement.classList.toggle("dark", newDarkMode)
    localStorage.setItem("theme", newDarkMode ? "dark" : "light")
    setIsDarkMode(newDarkMode)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          type="button"
          onClick={toggleDarkMode}
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? (
            <SunIcon aria-hidden="true" />
          ) : (
            <MoonIcon aria-hidden="true" />
          )}
          <span>{isDarkMode ? "Light mode" : "Dark mode"}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

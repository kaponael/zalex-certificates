"use client"

import type { ReactNode } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

type ListFilterProps = {
  label: string
  placeholder: string
  value: string
  onValueChange: (value: string) => void
  children?: ReactNode
}

export function ListFilter({
  label,
  placeholder,
  value,
  onValueChange,
  children,
}: ListFilterProps) {
  return (
    <InputGroup aria-label={label}>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {children && <InputGroupAddon align="inline-end">{children}</InputGroupAddon>}
    </InputGroup>
  )
}

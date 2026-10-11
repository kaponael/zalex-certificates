"use client"

import type { ComponentProps, ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FieldProps = {
  id: string
  label: string
  error?: string
  counter?: ReactNode
}

type FormInputProps = FieldProps &
  Omit<
    ComponentProps<typeof Input>,
    "id" | "aria-describedby" | "aria-invalid"
  >

type FormTextareaProps = FieldProps &
  Omit<
    ComponentProps<typeof Textarea>,
    "id" | "aria-describedby" | "aria-invalid"
  >

type FormSelectProps = FieldProps &
  Omit<
    ComponentProps<typeof Select<string>>,
    "id" | "children" | "items" | "multiple"
  > & {
    options: readonly string[]
    placeholder?: string
  }

export function FormField({
  id,
  label,
  error,
  counter,
  children,
}: FieldProps & { children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex min-h-5 items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {counter != null && (
          <span
            id={`${id}-counter`}
            className="text-xs leading-none text-muted-foreground"
          >
            {counter}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm leading-5 text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function getDescribedBy(id: string, counter: ReactNode, error?: string) {
  const ids = []

  if (counter != null) ids.push(`${id}-counter`)
  if (error) ids.push(`${id}-error`)

  return ids.length ? ids.join(" ") : undefined
}

export function FormInput({
  id,
  label,
  error,
  counter,
  ...props
}: FormInputProps) {
  return (
    <FormField id={id} label={label} error={error} counter={counter}>
      <Input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={getDescribedBy(id, counter, error)}
      />
    </FormField>
  )
}

export function FormTextarea({
  id,
  label,
  error,
  counter,
  ...props
}: FormTextareaProps) {
  return (
    <FormField id={id} label={label} error={error} counter={counter}>
      <Textarea
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={getDescribedBy(id, counter, error)}
      />
    </FormField>
  )
}

export function FormSelect({
  id,
  label,
  error,
  options,
  counter,
  placeholder = "Select an option",
  ...props
}: FormSelectProps) {
  const items = options.map((option) => ({ value: option, label: option }))

  return (
    <FormField id={id} label={label} error={error} counter={counter}>
      <Select {...props} items={items}>
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={Boolean(error)}
          aria-describedby={getDescribedBy(id, counter, error)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FormField>
  )
}

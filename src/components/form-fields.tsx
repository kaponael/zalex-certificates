"use client"

import type { ComponentProps, ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

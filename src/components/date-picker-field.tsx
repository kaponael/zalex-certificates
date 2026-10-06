"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useState } from "react"
import { FormField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerFieldProps = {
  id: string
  name?: string
  label: string
  value?: Date
  onChange: (date: Date | undefined) => void
  error?: string
}

export function DatePickerField({
  id,
  name = id,
  label,
  value,
  onChange,
  error,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <FormField id={id} label={label} error={error}>
      <div className="w-full">
        <input
          type="hidden"
          name={name}
          value={value ? format(value, "yyyy-MM-dd") : ""}
        />
        <Popover
          modal={false}
          open={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
        >
          <PopoverTrigger
            render={
              <Button
                id={id}
                type="button"
                data-empty={!value}
                className="h-9 w-full min-w-0 justify-start rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-base font-normal text-foreground shadow-none hover:bg-input/50 focus-visible:border-ring data-[empty=true]:text-muted-foreground"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
              />
            }
          >
            <CalendarIcon className="size-4" />
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => {
                onChange(date)
                setIsOpen(false)
              }}
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date <= today
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </FormField>
  )
}

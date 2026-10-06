"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { CertificateStatusBadge } from "@/components/certificate-status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { CertificateRequest } from "@/types/certificate-request"

type SortField = "issuedOn" | "status"
type SortDirection = "asc" | "desc"

type Sort = {
  field: SortField
  direction: SortDirection
}

const filterColumns = [
  {
    field: "referenceNo",
    label: "Reference No.",
    placeholder: "Filter by reference number",
  },
  {
    field: "addressTo",
    label: "Address to",
    placeholder: "Filter by address",
  },
  {
    field: "status",
    label: "Status",
    placeholder: "Filter by status",
  },
] as const

type FilterField = (typeof filterColumns)[number]["field"]

export function CertificateDataTable({
  data,
}: {
  data: CertificateRequest[]
}) {
  const [sort, setSort] = useState<Sort | null>(null)
  const [filterField, setFilterField] = useState<FilterField>("addressTo")
  const [filterValue, setFilterValue] = useState("")

  const selectedFilterColumn =
    filterColumns.find((column) => column.field === filterField) ??
    filterColumns[0]

  function handleSort(field: SortField) {
    setSort((currentSort) => {
      // Clicking the same column flips asc/desc
      if (currentSort?.field === field) {
        return {
          field,
          direction:
            currentSort.direction === "asc"
              ? "desc"
              : "asc",
        }
      }

      // Clicking a new sortable column starts ascending
      return {
        field,
        direction: "asc",
      }
    })
  }

  const filteredData = useMemo(() => {
    const query = filterValue.trim().toLowerCase()

    if (!query) {
      return data
    }

    return data.filter((request) => {
      if (filterField === "referenceNo") {
        return String(request.referenceNo ?? "").toLowerCase() === query
      }

      if (filterField === "status") {
        return request.status.toLowerCase() === query
      }

      return request.addressTo.toLowerCase().includes(query)
    })
  }, [data, filterField, filterValue])

  const sortedData = useMemo(() => {
    if (!sort) {
      return filteredData
    }

    return [...filteredData].sort((a, b) => {
      let result: number

      if (sort.field === "issuedOn") {
        result = Date.parse(a.issuedOn) - Date.parse(b.issuedOn)
      } else {
        result = a.status.localeCompare(b.status)
      }

      return sort.direction === "asc"
        ? result
        : -result
    })
  }, [filteredData, sort])

  function getSortIcon(field: SortField) {
    if (sort?.field !== field) {
      return <ArrowUpDownIcon />
    }

    return sort.direction === "asc"
      ? <ArrowUpIcon />
      : <ArrowDownIcon />
  }

  return (
    <div>
      <div className="mb-4 max-w-md">
        <InputGroup aria-label="Filter certificate requests">
          <InputGroupInput
            type="search"
            value={filterValue}
            onChange={(event) => setFilterValue(event.currentTarget.value)}
            placeholder={selectedFilterColumn.placeholder}
            aria-label={selectedFilterColumn.placeholder}
          />

          <InputGroupAddon align="inline-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <InputGroupButton
                    variant="ghost"
                    className="pr-1.5! text-xs"
                    aria-label={`Filter by ${selectedFilterColumn.label}`}
                  />
                }
              >
                {selectedFilterColumn.label}
                <ChevronDownIcon className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                alignOffset={-4}
              >
                <DropdownMenuGroup>
                  {filterColumns.map((column) => (
                    <DropdownMenuItem
                      key={column.field}
                      onClick={() => setFilterField(column.field)}
                    >
                      {column.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference No.</TableHead>

              <TableHead>Address to</TableHead>

              <TableHead>Purpose</TableHead>

              <TableHead>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("issuedOn")}
                >
                  Issued on
                  {getSortIcon("issuedOn")}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {getSortIcon("status")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((request, index) => (
                <TableRow key={`${request.referenceNo}-${index}`}>
                  <TableCell>
                    {request.referenceNo}
                  </TableCell>

                  <TableCell>
                    {request.addressTo}
                  </TableCell>

                  <TableCell>
                    {request.purpose}
                  </TableCell>

                  <TableCell>
                    {request.issuedOn}
                  </TableCell>

                  <TableCell>
                    <CertificateStatusBadge status={request.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center"
                >
                  No certificate requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

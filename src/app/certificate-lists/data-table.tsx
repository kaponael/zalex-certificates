"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ListFilter } from "@/components/list-filter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroupButton } from "@/components/ui/input-group"
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

const resultsPerPage = 10

export function CertificateDataTable({
  data,
}: {
  data: CertificateRequest[]
}) {
  const [sort, setSort] = useState<Sort | null>(null)
  const [filterField, setFilterField] = useState<FilterField>("addressTo")
  const [filterValue, setFilterValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const selectedFilterColumn =
    filterColumns.find((column) => column.field === filterField) ??
    filterColumns[0]

  function handleSort(field: SortField) {
    setCurrentPage(1)
    setSort((currentSort) => {
      if (currentSort?.field === field) {
        return {
          field,
          direction:
            currentSort.direction === "asc"
              ? "desc"
              : "asc",
        }
      }

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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / resultsPerPage))
  const pageNumber = Math.min(currentPage, totalPages)
  const firstResultIndex = (pageNumber - 1) * resultsPerPage
  const pageData = sortedData.slice(firstResultIndex, firstResultIndex + resultsPerPage)

  if (currentPage > totalPages) {
    setCurrentPage(totalPages)
  }

  function getSortIcon(field: SortField) {
    if (sort?.field !== field) {
      return <ArrowUpDownIcon />
    }

    return sort.direction === "asc"
      ? <ArrowUpIcon />
      : <ArrowDownIcon />
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="w-full max-w-md">
        <ListFilter
          label="Filter certificate requests"
          value={filterValue}
          onValueChange={(value) => {
            setFilterValue(value)
            setCurrentPage(1)
          }}
          placeholder={selectedFilterColumn.placeholder}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <InputGroupButton
                  variant="ghost"
                  className="shrink-0 pr-1.5! text-xs"
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
                    onClick={() => {
                      setFilterField(column.field)
                      setCurrentPage(1)
                    }}
                  >
                    {column.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ListFilter>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:hidden" aria-label="Sort certificate requests">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Button
          type="button"
          variant="ghost"
          className="min-h-10 px-3"
          aria-label={`Sort by issued on${sort?.field === "issuedOn" ? `, currently ${sort.direction === "asc" ? "ascending" : "descending"}` : ""}`}
          onClick={() => handleSort("issuedOn")}
        >
          Issued on
          {getSortIcon("issuedOn")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-10 px-3"
          aria-label={`Sort by status${sort?.field === "status" ? `, currently ${sort.direction === "asc" ? "ascending" : "descending"}` : ""}`}
          onClick={() => handleSort("status")}
        >
          Status
          {getSortIcon("status")}
        </Button>
      </div>

      <div className="md:hidden">
        {sortedData.length === 0 ? (
          <p className="rounded-md border p-6 text-center text-sm">
            No certificate requests found.
          </p>
        ) : (
          <ul className="grid gap-4">
            {pageData.map((request, index) => (
              <li key={`${request.referenceNo}-${firstResultIndex + index}`} className="min-w-0 rounded-md border p-4">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <h2 className="min-w-0 text-sm font-semibold [overflow-wrap:anywhere]">
                    Reference No. {request.referenceNo}
                  </h2>
                  <div className="min-w-0 max-w-full [&_[data-slot=badge]]:h-auto [&_[data-slot=badge]]:min-h-5 [&_[data-slot=badge]]:max-w-full [&_[data-slot=badge]]:whitespace-normal [&_[data-slot=badge]]:[overflow-wrap:anywhere]">
                    <CertificateStatusBadge status={request.status} />
                  </div>
                </div>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">Address to</dt>
                    <dd className="mt-1 [overflow-wrap:anywhere]">{request.addressTo}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">Certified by</dt>
                    <dd className="mt-1 [overflow-wrap:anywhere]">{request.certified_by?.join(", ") || "—"}</dd>
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="text-muted-foreground">Purpose</dt>
                    <dd className="mt-1 [overflow-wrap:anywhere]">{request.purpose}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">Issued on</dt>
                    <dd className="mt-1 [overflow-wrap:anywhere]">{request.issuedOn}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hidden min-w-0 rounded-md border md:block">
        <Table className="min-w-[56rem] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12%]">Reference No.</TableHead>

              <TableHead className="w-[18%]">Address to</TableHead>

              <TableHead className="w-[28%]">Purpose</TableHead>

              <TableHead className="w-[14%]">Certified By</TableHead>

              <TableHead
                className="w-[14%]"
                aria-sort={sort?.field === "issuedOn" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
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

              <TableHead
                className="w-[14%]"
                aria-sort={sort?.field === "status" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              >
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
              pageData.map((request, index) => (
                <TableRow key={`${request.referenceNo}-${firstResultIndex + index}`} className="[&>td]:align-top [&>td]:whitespace-normal [&>td]:[overflow-wrap:anywhere]">
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
                    {request.certified_by?.join(", ") || "—"}
                  </TableCell>

                  <TableCell>
                    {request.issuedOn}
                  </TableCell>

                  <TableCell className="[&_[data-slot=badge]]:h-auto [&_[data-slot=badge]]:min-h-5 [&_[data-slot=badge]]:max-w-full [&_[data-slot=badge]]:whitespace-normal [&_[data-slot=badge]]:[overflow-wrap:anywhere]">
                    <CertificateStatusBadge status={request.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center"
                >
                  No certificate requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <nav
        aria-label="Certificate list pagination"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-muted-foreground" role="status">
          Showing {sortedData.length === 0 ? 0 : firstResultIndex + 1}
          {"–"}{Math.min(firstResultIndex + resultsPerPage, sortedData.length)}
          {" of "}{sortedData.length} results
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-10 px-3"
            disabled={pageNumber === 1}
            onClick={() => setCurrentPage(pageNumber - 1)}
          >
            <ChevronLeftIcon />
            Previous
          </Button>
          <span className="text-sm" aria-live="polite">
            Page {pageNumber} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            className="min-h-10 px-3"
            disabled={pageNumber === totalPages}
            onClick={() => setCurrentPage(pageNumber + 1)}
          >
            Next
            <ChevronRightIcon />
          </Button>
        </div>
      </nav>
    </div>
  )
}

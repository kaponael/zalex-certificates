"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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

export function CertificateDataTable({
  data,
}: {
  data: CertificateRequest[]
}) {
  const [sort, setSort] = useState<Sort | null>(null)

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

  const sortedData = useMemo(() => {
    if (!sort) {
      return data
    }

    return [...data].sort((a, b) => {
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
  }, [data, sort])

  function getSortIcon(field: SortField) {
    if (sort?.field !== field) {
      return <ArrowUpDownIcon />
    }

    return sort.direction === "asc"
      ? <ArrowUpIcon />
      : <ArrowDownIcon />
  }

  return (
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
  )
}

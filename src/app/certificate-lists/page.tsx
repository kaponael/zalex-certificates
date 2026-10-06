"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { getCertificateRequests } from "@/api/certificate-request-api"
import { CertificateDataTable } from "./data-table"
import type { CertificateRequest } from "@/types/certificate-request"

export default function CertificateListsPage() {
  const [certificateRequests, setCertificateRequests] = useState<
    CertificateRequest[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isActive = true

    getCertificateRequests()
      .then((requests) => {
        if (isActive) setCertificateRequests(requests)
      })
      .catch(() => {
        if (isActive) setError("Unable to load certificate requests.")
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  return (
    <>
      <PageHeader title="Certificate Lists" />
      <section className="flex-1 p-6">
        {isLoading ? (
          <p role="status">Loading certificate requests...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : (
          <CertificateDataTable data={certificateRequests} />
        )}
      </section>
    </>
  )
}

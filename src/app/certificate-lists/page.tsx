"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { getCertificateRequests } from "@/api/certificate-request-api"
import {
  getLocalCertificateRequests,
  localCertificateRequestsStorageKey,
  localCertificateRequestsUpdatedEvent,
} from "@/lib/certificate-request-storage"
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
    let apiRequests: CertificateRequest[] = []
    let apiFailed = false

    function refreshRequests() {
      if (!isActive) return

      const localRequests = getLocalCertificateRequests()
      setCertificateRequests([...apiRequests, ...localRequests])
      setError(
        apiFailed && localRequests.length === 0
          ? "Unable to load certificate requests."
          : ""
      )
    }

    function handleStorageChange(event: StorageEvent) {
      if (
        event.key === localCertificateRequestsStorageKey ||
        event.key === null
      ) {
        refreshRequests()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener(localCertificateRequestsUpdatedEvent, refreshRequests)

    getCertificateRequests()
      .then((requests) => {
        apiRequests = requests
        apiFailed = false
        refreshRequests()
      })
      .catch(() => {
        apiRequests = []
        apiFailed = true
        refreshRequests()
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener(
        localCertificateRequestsUpdatedEvent,
        refreshRequests
      )
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

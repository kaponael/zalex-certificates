import type {
  CertificateRequest,
  CertificateRequestPayload,
} from "@/types/certificate-request"

export const localCertificateRequestsStorageKey =
  "zalex-certificates:certificate-requests"
export const localCertificateRequestsUpdatedEvent =
  "zalex-certificates:certificate-requests-updated"

const minimumReferenceNumber = 0
const maximumReferenceNumber = 100

// Checks that a saved value looks like a certificate request.
function isCertificateRequest(value: unknown): value is CertificateRequest {
  if (typeof value !== "object" || value === null) return false

  const request = value as Record<string, unknown>

  return (
    typeof request.referenceNo === "string" &&
    typeof request.addressTo === "string" &&
    typeof request.purpose === "string" &&
    typeof request.issuedOn === "string" &&
    typeof request.status === "string"
  )
}

// Reads saved requests from browser storage.
function readStoredRequests(): CertificateRequest[] {
  if (typeof window === "undefined") return []

  try {
    const savedRequests = window.localStorage.getItem(
      localCertificateRequestsStorageKey
    )
    const parsedRequests: unknown = JSON.parse(savedRequests ?? "[]")

    return Array.isArray(parsedRequests)
      ? parsedRequests.filter(isCertificateRequest)
      : []
  } catch {
    return []
  }
}

// Saves the updated request list to browser storage.
function saveStoredRequests(requests: CertificateRequest[]): boolean {
  try {
    window.localStorage.setItem(
      localCertificateRequestsStorageKey,
      JSON.stringify(requests)
    )
    return true
  } catch {
    return false
  }
}

// Finds the first unused number from 0 to 100.
function getNextReferenceNumber(
  apiRequests: CertificateRequest[],
  localRequests: CertificateRequest[]
): number | null {
  const usedNumbers = new Set<number>()

  for (const request of [...apiRequests, ...localRequests]) {
    if (!/^\d+$/.test(request.referenceNo)) continue

    const referenceNumber = Number(request.referenceNo)

    if (
      Number.isInteger(referenceNumber) &&
      referenceNumber >= minimumReferenceNumber &&
      referenceNumber <= maximumReferenceNumber
    ) {
      usedNumbers.add(referenceNumber)
    }
  }

  for (
    let referenceNumber = minimumReferenceNumber;
    referenceNumber <= maximumReferenceNumber;
    referenceNumber += 1
  ) {
    if (!usedNumbers.has(referenceNumber)) return referenceNumber
  }

  return null
}

// Gets saved requests for the certificate list page.
export function getLocalCertificateRequests(): CertificateRequest[] {
  return readStoredRequests()
}

// Adds a request to browser storage and tells the list to refresh.
export function appendLocalCertificateRequest(
  payload: CertificateRequestPayload,
  apiRequests: CertificateRequest[] = []
): CertificateRequest | null {
  if (typeof window === "undefined") return null

  const localRequests = readStoredRequests()
  const referenceNumber = getNextReferenceNumber(apiRequests, localRequests)

  if (referenceNumber === null) return null

  const request: CertificateRequest = {
    referenceNo: String(referenceNumber),
    addressTo: payload.address_to,
    purpose: payload.purpose,
    issuedOn: payload.issued_on,
    status: "New",
  }

  if (!saveStoredRequests([...localRequests, request])) return null

  window.dispatchEvent(new Event(localCertificateRequestsUpdatedEvent))
  return request
}

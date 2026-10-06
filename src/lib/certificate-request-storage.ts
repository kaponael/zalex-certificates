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

type StoredCertificateRequest = CertificateRequest & {
  employeeId: string
}

function parseReferenceNumber(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null
  }

  const text = String(value).trim()

  if (!/^\d+$/.test(text)) {
    return null
  }

  const referenceNumber = Number(text)

  return Number.isInteger(referenceNumber) &&
    referenceNumber >= minimumReferenceNumber &&
    referenceNumber <= maximumReferenceNumber
    ? referenceNumber
    : null
}

function normalizeStoredRequest(value: unknown): StoredCertificateRequest | null {
  if (typeof value !== "object" || value === null) {
    return null
  }

  const request = value as Record<string, unknown>
  const referenceNo = request.referenceNo

  if (
    (typeof referenceNo !== "string" && typeof referenceNo !== "number") ||
    typeof request.addressTo !== "string" ||
    typeof request.purpose !== "string" ||
    typeof request.issuedOn !== "string" ||
    typeof request.status !== "string" ||
    (request.employeeId !== undefined && typeof request.employeeId !== "string")
  ) {
    return null
  }

  return {
    referenceNo: String(referenceNo),
    addressTo: request.addressTo,
    purpose: request.purpose,
    issuedOn: request.issuedOn,
    status: request.status,
    employeeId: typeof request.employeeId === "string" ? request.employeeId : "",
  }
}

function readStoredRequests(): StoredCertificateRequest[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const savedRequests = window.localStorage.getItem(
      localCertificateRequestsStorageKey
    )

    if (!savedRequests) {
      return []
    }

    const parsedRequests: unknown = JSON.parse(savedRequests)

    if (!Array.isArray(parsedRequests)) {
      return []
    }

    const requests: StoredCertificateRequest[] = []

    for (const parsedRequest of parsedRequests) {
      const request = normalizeStoredRequest(parsedRequest)

      if (request) {
        requests.push(request)
      }
    }

    return requests
  } catch {
    return []
  }
}

function getAvailableReferenceNumber(usedNumbers: Set<number>): number | null {
  for (
    let referenceNumber = minimumReferenceNumber;
    referenceNumber <= maximumReferenceNumber;
    referenceNumber += 1
  ) {
    if (!usedNumbers.has(referenceNumber)) {
      return referenceNumber
    }
  }

  return null
}

function reconcileLocalReferenceNumbers(
  localRequests: StoredCertificateRequest[],
  apiRequests: CertificateRequest[]
) {
  const usedNumbers = new Set<number>()

  for (const request of apiRequests) {
    const referenceNumber = parseReferenceNumber(request.referenceNo)

    if (referenceNumber !== null) {
      usedNumbers.add(referenceNumber)
    }
  }

  let changed = false

  const requests = localRequests.map((request) => {
    const currentNumber = parseReferenceNumber(request.referenceNo)
    const isAvailable =
      currentNumber !== null && !usedNumbers.has(currentNumber)
    const referenceNumber = isAvailable
      ? currentNumber
      : getAvailableReferenceNumber(usedNumbers)

    if (referenceNumber === null) {
      return request
    }

    usedNumbers.add(referenceNumber)

    if (referenceNumber === currentNumber) {
      return request
    }

    changed = true
    return { ...request, referenceNo: String(referenceNumber) }
  })

  return { requests, changed, usedNumbers }
}

function saveStoredRequests(requests: StoredCertificateRequest[]): boolean {
  if (typeof window === "undefined") {
    return false
  }

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

function toCertificateRequest(
  request: StoredCertificateRequest
): CertificateRequest {
  return {
    referenceNo: request.referenceNo,
    addressTo: request.addressTo,
    purpose: request.purpose,
    issuedOn: request.issuedOn,
    status: request.status,
  }
}

export function getLocalCertificateRequests(
  apiRequests: CertificateRequest[] = []
): CertificateRequest[] {
  const result = reconcileLocalReferenceNumbers(
    readStoredRequests(),
    apiRequests
  )

  if (result.changed) {
    saveStoredRequests(result.requests)
  }

  return result.requests.map(toCertificateRequest)
}

export function appendLocalCertificateRequest(
  payload: CertificateRequestPayload,
  apiRequests: CertificateRequest[] = []
): CertificateRequest | null {
  if (typeof window === "undefined") {
    return null
  }

  const result = reconcileLocalReferenceNumbers(
    readStoredRequests(),
    apiRequests
  )
  const referenceNumber = getAvailableReferenceNumber(result.usedNumbers)

  if (referenceNumber === null) {
    return null
  }

  const request: StoredCertificateRequest = {
    referenceNo: String(referenceNumber),
    addressTo: payload.address_to,
    purpose: payload.purpose,
    issuedOn: payload.issued_on,
    status: "New",
    employeeId: payload.employee_id,
  }

  if (!saveStoredRequests([...result.requests, request])) {
    return null
  }

  window.dispatchEvent(new Event(localCertificateRequestsUpdatedEvent))

  return toCertificateRequest(request)
}

import axios from "axios"
import type {
  CertificateRequest,
  CertificateRequestDto,
  CertificateRequestPayload,
  CertificateRequestResponse,
} from "@/types/certificate-request"

export async function submitCertificateRequest(
  payload: CertificateRequestPayload
) {
  const { data } = await axios.post<CertificateRequestResponse>(
    "/api/request-certificate",
    payload,
    { headers: { "Content-Type": "application/json" } }
  )

  if (data.responce !== "Ok") {
    throw new Error("Certificate request failed.")
  }
}

export async function getCertificateRequests(): Promise<CertificateRequest[]> {
  const { data } = await axios.get<CertificateRequestDto[]>(
    "/api/certificate-list"
  )

  return data.map(mapCertificateRequest)
}

export function mapCertificateRequest(
  request: CertificateRequestDto
): CertificateRequest {
  return {
    // The API response example does not include reference number or status.
    referenceNo: request.reference_no,
    addressTo: request.address_to,
    purpose: request.purpose,
    issuedOn: request.issued_on,
    status: request.status,
  }
}

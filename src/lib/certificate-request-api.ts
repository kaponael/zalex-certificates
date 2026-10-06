import axios from "axios"
import type {
  CertificateRequestPayload,
  CertificateRequestResponse
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

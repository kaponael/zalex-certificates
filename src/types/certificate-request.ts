export type CertificateRequest = {
  referenceNo: string
  addressTo: string
  purpose: string
  issuedOn: string
  status: string
}

export type FormErrors = {
  addressTo?: string
  purpose?: string
  issuedOn?: string
  employeeId?: string
}

export type CertificateRequestPayload = {
  address_to: string
  purpose: string
  issued_on: string
  employee_id: string
}

export type CertificateRequestDto = {
  reference_no: string | number
  address_to: string
  purpose: string
  issued_on: string
  status: string
  employee_id: string
}

export type CertificateRequestResponse = {
  responce?: string
}

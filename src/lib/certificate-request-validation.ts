import type { FormErrors } from "@/types/certificate-request"

export type CertificateRequestFormValues = {
  addressTo: string
  purpose: string
  issuedOn: string
  employeeId: string
}

export function validateCertificateRequestForm(
  values: CertificateRequestFormValues
): FormErrors {
  const errors: FormErrors = {}

  const addressTo = values.addressTo.trim()

  if (!addressTo) {
    errors.addressTo = "Address to is required."
  } else if (!/^[\p{L}\p{N}\s]+$/u.test(addressTo)) {
    errors.addressTo = "Use letters and numbers only; spaces are allowed."
  }

  if (!values.purpose) {
    errors.purpose = "Purpose is required."
  } else if (values.purpose.length < 50) {
    errors.purpose = "Purpose must be at least 50 characters."
  }

  const today = new Date()
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-")

  if (!values.issuedOn) {
    errors.issuedOn = "Issued on date is required."
  } else if (values.issuedOn <= todayString) {
    errors.issuedOn = "Choose a date in the future."
  }

  if (!values.employeeId.trim()) {
    errors.employeeId = "Employee ID is required."
  } else if (!/^\d+$/.test(values.employeeId)) {
    errors.employeeId = "Employee ID must contain numbers only."
  }

  return errors
}

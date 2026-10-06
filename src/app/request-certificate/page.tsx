"use client"

import { useState, type FormEvent } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { DatePickerField } from "@/components/date-picker-field"
import { FormInput, FormTextarea } from "@/components/form-fields"
import {
  getCertificateRequests,
  submitCertificateRequest,
} from "@/api/certificate-request-api"
import { validateCertificateRequestForm } from "@/lib/certificate-request-validation"
import { appendLocalCertificateRequest } from "@/lib/certificate-request-storage"
import type { CertificateRequest, FormErrors } from "@/types/certificate-request"

const successMessage = "Certificate request submitted successfully."

export default function RequestCertificatePage() {
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [purposeLength, setPurposeLength] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date>()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const formData = new FormData(form)
    const addressTo = String(formData.get("addressTo") ?? "").trim()
    const purpose = String(formData.get("purpose") ?? "").trim()
    const issuedOn = String(formData.get("issuedOn") ?? "")
    const employeeId = String(formData.get("employeeId") ?? "")

    const nextErrors = validateCertificateRequestForm({
      addressTo,
      purpose,
      issuedOn,
      employeeId,
    })

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    const [year, month, day] = issuedOn.split("-")
    const apiIssuedOn = `${Number(month)}/${Number(day)}/${year}`

    setIsSubmitting(true)

    try {
      const payload = {
        address_to: addressTo,
        purpose,
        issued_on: apiIssuedOn,
        employee_id: employeeId,
      }

      let apiRequests: CertificateRequest[] = []
      let apiListFetchFailed = false

      try {
        apiRequests = await getCertificateRequests()
      } catch {
        apiListFetchFailed = true
      }

      const savedRequest = appendLocalCertificateRequest(payload, apiRequests)
      let apiSubmissionFailed = false

      try {
        await submitCertificateRequest(payload)
      } catch {
        apiSubmissionFailed = true
      }

      if (savedRequest && !apiSubmissionFailed && !apiListFetchFailed) {
        toast.add({ title: successMessage, type: "success" })
      } else if (savedRequest) {
        const warnings: string[] = []

        if (apiSubmissionFailed) {
          warnings.push("the API did not confirm the request")
        }

        if (apiListFetchFailed) {
          warnings.push("reference numbers could not be checked against the API")
        }

        toast.add({
          title: `Request saved locally, but ${warnings.join(" and ")}.`,
          type: "warning",
        })
      } else if (!apiSubmissionFailed) {
        toast.add({
          title: "The API accepted the request, but the local record could not be saved.",
          type: "error",
        })
      } else {
        toast.add({
          title: "Unable to save the request locally or submit it to the API.",
          type: "error",
        })
      }

      if (savedRequest || !apiSubmissionFailed) {
        form.reset()
        setPurposeLength(0)
        setSelectedDate(undefined)
      }
    } catch {
      toast.add({
        title: "Unable to submit your request. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Request Certificate" />
      <section className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <Label className="text-2xl">Create a Certificate Request</Label>
        <form
          className="w-full max-w-xl space-y-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <FormTextarea
            id="addressTo"
            name="addressTo"
            label="Address to"
            error={errors.addressTo}
            required
          />

          <FormTextarea
            id="purpose"
            name="purpose"
            label="Purpose"
            error={errors.purpose}
            counter={`${purposeLength} characters (minimum 50)`}
            onChange={(event) =>
              setPurposeLength(event.currentTarget.value.trim().length)
            }
            required
          />

          <DatePickerField
            id="issuedOn"
            label="Issued on"
            value={selectedDate}
            onChange={setSelectedDate}
            error={errors.issuedOn}
          />

          <FormInput
            id="employeeId"
            name="employeeId"
            label="Employee ID"
            error={errors.employeeId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </section>
    </>
  )
}

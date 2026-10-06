import { PageHeader } from "@/components/page-header"
import { CertificateDataTable } from "./data-table"
import type { CertificateRequest } from "@/types/certificate-request"

const certificateRequests: CertificateRequest[] = []

export default function CertificateListsPage() {
  return (
    <>
      <PageHeader title="Certificate Lists" />
      <section className="flex-1 p-6">
        <CertificateDataTable data={certificateRequests} />
      </section>
    </>
  )
}

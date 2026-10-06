import { Badge } from "@/components/ui/badge"

export enum CertificateStatus {
  Done = "Done",
  New = "New",
  Pending = "Pending",
  UnderReview = "Under Review",
  Rejected = "rejected",
  Unknown = "Unknown",
}

export const certificateStatusColors: Record<CertificateStatus, string> = {
  [CertificateStatus.Done]:
    "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  [CertificateStatus.New]:
    "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  [CertificateStatus.Pending]:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  [CertificateStatus.UnderReview]:
    "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  [CertificateStatus.Rejected]:
    "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
  [CertificateStatus.Unknown]:
    "border-transparent bg-muted text-muted-foreground",
}

type CertificateStatusBadgeProps = {
  status: string
}

export function CertificateStatusBadge({ status }: CertificateStatusBadgeProps) {
  const label = status.trim() || CertificateStatus.Unknown
  const knownStatus = Object.values(CertificateStatus).find(
    (value) => value.toLowerCase() === label.toLowerCase()
  )
  const colorStatus = knownStatus ?? CertificateStatus.Unknown

  return (
    <Badge variant="outline" className={certificateStatusColors[colorStatus]}>
      {label}
    </Badge>
  )
}

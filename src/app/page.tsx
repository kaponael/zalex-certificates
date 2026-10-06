import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"

export default function Home() {
  return (
    <>
      <PageHeader title="Home" />
      <section className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        <h1 className="text-4xl font-bold">Welcome to Zalex Certificates!</h1>
        <div className="flex flex-col gap-6 sm:flex-row">
          <Button
            className="px-20 py-10 text-lg"
            nativeButton={false}
            render={<Link href="/certificate-lists" />}
            size="lg"
          >
            Certificate Lists
          </Button>
          <Button
            className="px-20 py-10 text-lg"
            nativeButton={false}
            render={<Link href="/request-certificate" />}
            size="lg"
          >
            Request Certificate
          </Button>
        </div>
      </section>
    </>
  )
}

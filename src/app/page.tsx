import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"

export default function Home() {
  return (
    <>
      <PageHeader title="Home" />
      <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8 sm:p-6 lg:p-10">
        <h2 className="max-w-3xl text-center text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">
          Welcome to Zalex Certificates!
        </h2>
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2 sm:gap-6">
          <Button
            className="h-auto min-h-20 w-full min-w-0 px-4 py-6 text-base whitespace-normal sm:min-h-24 sm:px-6 sm:text-lg"
            nativeButton={false}
            render={<Link href="/certificate-lists" />}
            size="lg"
          >
            Certificate Lists
          </Button>
          <Button
            className="h-auto min-h-20 w-full min-w-0 px-4 py-6 text-base whitespace-normal sm:min-h-24 sm:px-6 sm:text-lg"
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

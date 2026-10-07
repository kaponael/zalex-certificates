// Next.js runs this handler for GET requests to /api/certificate-list.
// The folder sets the URL, and the function name matches the HTTP method.
export async function GET() {
  const apiKey = process.env.API_KEY

  if (!apiKey) {
    return Response.json(
      { error: "API key is not configured." },
      { status: 500 }
    )
  }

  const url = new URL("https://zalexinc.azure-api.net/request-list")
  url.searchParams.set("subscription-key", apiKey)

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      return Response.json(
        { error: "Failed to retrieve certificate requests." },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch {
    return Response.json(
      { error: "Failed to retrieve certificate requests." },
      { status: 502 }
    )
  }
}

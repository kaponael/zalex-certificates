// Next.js runs this handler for POST requests to /api/request-certificate.
// The folder sets the URL, and the function name matches the HTTP method.
export async function POST(request: Request) {
  const apiKey = process.env.API_KEY

  if (!apiKey) {
    return Response.json(
      { error: "Certificate API key is not configured." },
      { status: 500 }
    )
  }

  try {
    const formData = await request.json()
    const url = new URL("https://zalexinc.azure-api.net/request-certificate")
    url.searchParams.set("subscription-key", apiKey)

    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      cache: "no-store",
    })

    const result = await apiResponse.json()
    return Response.json(result, { status: apiResponse.status })
  } catch {
    return Response.json(
      { error: "Unable to contact the certificate API." },
      { status: 502 }
    )
  }
}

export async function GET(request: Request) {
  return proxyRequest(request, "GET")
}

export async function POST(request: Request) {
  return proxyRequest(request, "POST")
}

export async function PUT(request: Request) {
  return proxyRequest(request, "PUT")
}

export async function PATCH(request: Request) {
  return proxyRequest(request, "PATCH")
}

export async function DELETE(request: Request) {
  return proxyRequest(request, "DELETE")
}

async function proxyRequest(request: Request, method: string) {
  try {
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get("target")

    if (!targetUrl) {
      return Response.json(
        { error: "Missing 'target' query parameter" },
        { status: 400 }
      )
    }

    const body =
      method !== "GET" && method !== "DELETE"
        ? await request.text()
        : undefined

    const response = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization")
          ? { authorization: request.headers.get("authorization")! }
          : {}),
      },
      body,
    })

    const responseData = await response.text()

    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error: any) {
    return Response.json(
      {
        error: error.message || "Proxy request failed",
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

"use client"

import { useState } from "react"
import { Send, Copy, Trash2, Eye, EyeOff } from "lucide-react"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export default function ApiTesterPage() {
  const [method, setMethod] = useState<HttpMethod>("GET")
  const [endpoint, setEndpoint] = useState(
    `${process.env.NEXT_PUBLIC_API_BASE}/phones/`
  )
  const [body, setBody] = useState("{}")
  const [response, setResponse] = useState<{
    status: number
    statusText: string
    headers: Record<string, string>
    data: any
    time: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showResponse, setShowResponse] = useState(false)

  const handleSendRequest = async () => {
    setLoading(true)
    setError("")
    setResponse(null)

    try {
      const startTime = Date.now()
      
      let parseBody = undefined
      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        try {
          parseBody = JSON.parse(body)
        } catch (e) {
          throw new Error("Invalid JSON in request body")
        }
      }

      // Use proxy for external URLs to bypass CORS
      const isExternal = endpoint.startsWith("http://") || endpoint.startsWith("https://")
      const requestUrl = isExternal
        ? `/api/proxy?target=${encodeURIComponent(endpoint)}`
        : endpoint

      const res = await fetch(requestUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: parseBody ? JSON.stringify(parseBody) : undefined,
      })

      const endTime = Date.now()
      const responseData = await res.text()
      let parsedData: any
      try {
        parsedData = JSON.parse(responseData)
      } catch {
        parsedData = responseData
      }

      const headers: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        headers[key] = value
      })

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers,
        data: parsedData,
        time: endTime - startTime,
      })
      setShowResponse(true)
    } catch (err: any) {
      setError(err.message || "Request failed")
    } finally {
      setLoading(false)
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-extrabold text-[#f0eeff]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          API Tester
        </h1>
        <p className="mt-1 text-sm text-[#8884a0]">
          Test your backend APIs directly from here
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Request Panel */}
        <div className="rounded-lg border border-white/10 bg-[#14141c] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#f0eeff]">Request</h2>

          {/* Method & Endpoint */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="rounded-lg border border-white/10 bg-[#0a0a0f] px-4 py-2 text-sm font-semibold text-[#f0eeff] outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.example.com/phones"
                className="flex-1 rounded-lg border border-white/10 bg-[#0a0a0f] px-4 py-2 text-sm text-[#f0eeff] placeholder-[#8884a0] outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
              />
            </div>

            {/* Body */}
            {["POST", "PUT", "PATCH"].includes(method) && (
              <div>
                <label className="block text-xs font-semibold text-[#8884a0] mb-2">
                  Body (JSON)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"name": "iPhone 15 Pro", "brand": "Apple"}'
                  className="w-full h-64 rounded-lg border border-white/10 bg-[#0a0a0f] px-4 py-3 font-mono text-xs text-[#f0eeff] placeholder-[#8884a0] outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendRequest}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-violet-600 px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </div>

        {/* Response Panel */}
        <div className="rounded-lg border border-white/10 bg-[#14141c] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#f0eeff]">Response</h2>
            {response && (
              <button
                onClick={() => setShowResponse(!showResponse)}
                className="text-[#8884a0] hover:text-[#f0eeff] transition-colors"
              >
                {showResponse ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>

          {!response && !showResponse && (
            <div className="flex h-96 items-center justify-center text-center">
              <div>
                <p className="text-sm text-[#8884a0]">No response yet</p>
                <p className="mt-1 text-xs text-[#8884a0]/70">Send a request to see the response</p>
              </div>
            </div>
          )}

          {response && showResponse && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Status */}
              <div className="rounded-lg border border-white/8 bg-[#0a0a0f] p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-[#8884a0]">Status</p>
                  <span
                    className={`text-sm font-bold ${
                      response.status >= 200 && response.status < 300
                        ? "text-emerald-400"
                        : response.status >= 400
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {response.status} {response.statusText}
                  </span>
                </div>
                <p className="text-xs text-[#8884a0]">Time: {response.time}ms</p>
              </div>

              {/* Data */}
              <div className="rounded-lg border border-white/8 bg-[#0a0a0f] p-3">
                <p className="text-xs font-semibold text-[#8884a0] mb-2">Data</p>
                <pre className="text-xs text-[#f0eeff] overflow-x-auto bg-[#0e0e16] p-2 rounded border border-white/5 max-h-64 overflow-y-auto">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
                <button
                  onClick={copyResponse}
                  className="mt-2 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="rounded-lg border border-white/10 bg-[#14141c] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#f0eeff]">Quick Templates</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Create Phone",
              method: "POST" as HttpMethod,
              endpoint: `${process.env.NEXT_PUBLIC_API_BASE}/phones/`,
              body: {
                name: "iPhone 15 Pro",
                brand: "Apple",
                model: "A3106",
                slug: "iphone-15-pro",
                image: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.11.1/flags/4x3/us.svg",
                screen_size: "6.1",
                screen_resolution: "2556x1179",
                ram: "8GB",
                storage: "256GB",
                main_camera: "48MP",
                selfie_camera: "12MP",
                battery: "3582mAh",
                colors: ["Black", "White", "Gold"],
                features: ["5G", "Wireless Charging"],
                release_date: "2023-09-22",
              },
            },
            {
              label: "Get Phones",
              method: "GET" as HttpMethod,
              endpoint: `${process.env.NEXT_PUBLIC_API_BASE}/phones/`,
              body: "{}",
            },
            {
              label: "Get Single Phone",
              method: "GET" as HttpMethod,
              endpoint: `${process.env.NEXT_PUBLIC_API_BASE}/phones/1`,
              body: "{}",
            },
            {
              label: "Update Phone",
              method: "PUT" as HttpMethod,
              endpoint: `${process.env.NEXT_PUBLIC_API_BASE}/phones/1`,
              body: {
                name: "iPhone 15 Pro Max",
                brand: "Apple",
              },
            },
            {
              label: "Delete Phone",
              method: "DELETE" as HttpMethod,
              endpoint: `${process.env.NEXT_PUBLIC_API_BASE}/phones/1`,
              body: "{}",
            },
          ].map((template) => (
            <button
              key={template.label}
              onClick={() => {
                setMethod(template.method)
                setEndpoint(template.endpoint)
                setBody(
                  typeof template.body === "string"
                    ? template.body
                    : JSON.stringify(template.body, null, 2)
                )
                setError("")
                setResponse(null)
              }}
              className="rounded-lg border border-white/8 bg-[#0a0a0f] px-4 py-3 text-left transition-all hover:border-purple-500/40 hover:bg-purple-500/5"
            >
              <p className="text-xs font-semibold text-purple-400">{template.method}</p>
              <p className="mt-1 text-xs text-[#f0eeff]">{template.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

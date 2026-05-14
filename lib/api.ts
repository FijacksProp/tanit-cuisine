export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000/api"

function extractApiError(data: unknown) {
  if (typeof data === "string") return data
  if (!data || typeof data !== "object") return "Request failed"

  const record = data as Record<string, unknown>
  if (typeof record.detail === "string") return record.detail
  if (Array.isArray(record.non_field_errors) && record.non_field_errors.length > 0) {
    return String(record.non_field_errors[0])
  }

  for (const [field, value] of Object.entries(record)) {
    if (Array.isArray(value) && value.length > 0) {
      return `${field}: ${String(value[0])}`
    }
    if (typeof value === "string") {
      return `${field}: ${value}`
    }
  }

  return "Request failed"
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...init } = options
  let res: Response

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    })
  } catch {
    throw new Error(
      `Unable to reach the Tanit Cuisine API at ${API_BASE_URL}. Check that the backend is running, NEXT_PUBLIC_API_URL is set correctly, and CORS allows this frontend.`,
    )
  }

  const text = await res.text()
  const contentType = res.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")
  let data: unknown = null

  if (text && isJson) {
    try {
      data = JSON.parse(text)
    } catch {
      const preview = text.replace(/\s+/g, " ").trim().slice(0, 180)
      throw new Error(
        `API returned invalid JSON from ${API_BASE_URL}${path}. HTTP ${res.status} ${res.statusText}. ${preview}`,
      )
    }
  }

  if (!res.ok) {
    if (!isJson) {
      const preview = text.replace(/\s+/g, " ").trim().slice(0, 180)
      throw new Error(
        `API returned ${res.status} ${res.statusText} instead of JSON from ${API_BASE_URL}${path}. ${preview}`,
      )
    }

    throw new Error(extractApiError(data))
  }

  if (text && !isJson) {
    const preview = text.replace(/\s+/g, " ").trim().slice(0, 180)
    throw new Error(`API returned a non-JSON response from ${API_BASE_URL}${path}. ${preview}`)
  }

  return data as T
}

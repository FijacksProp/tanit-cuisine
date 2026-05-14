export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000/api"

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
  const data = text && isJson ? JSON.parse(text) : null

  if (!res.ok) {
    if (!isJson) {
      const preview = text.replace(/\s+/g, " ").trim().slice(0, 180)
      throw new Error(
        `API returned ${res.status} ${res.statusText} instead of JSON from ${API_BASE_URL}${path}. ${preview}`,
      )
    }

    const detail =
      typeof data === "string"
        ? data
        : data?.detail || data?.non_field_errors?.[0] || "Request failed"
    throw new Error(detail)
  }

  if (text && !isJson) {
    const preview = text.replace(/\s+/g, " ").trim().slice(0, 180)
    throw new Error(`API returned a non-JSON response from ${API_BASE_URL}${path}. ${preview}`)
  }

  return data as T
}

// lib/api.ts

// 通用 GET 请求封装
export async function apiGet<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`GET ${url} failed with status ${res.status}`);
  }

  // 明确为 Promise<T>
  return res.json() as Promise<T>;
}

// 通用 POST 请求封装
export async function apiPost<T = any>(
  url: string,
  data: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data ?? {}),
  });

  if (!res.ok) {
    throw new Error(`POST ${url} failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

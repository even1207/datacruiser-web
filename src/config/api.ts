export const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export interface AskResponse {
  success: boolean;
  question: string;
  answer: string;
  similar_records?: any[];
  total_records?: number;
  from_cache?: boolean;
  chart_suggestions?: Array<{
    chart_type: 'line' | 'bar' | 'scatter' | 'area' | 'pie';
    columns: string[];
    reason?: string;
  }>;
  dataset_id?: string;
}

export interface UploadResponse {
  success: boolean;
  dataset: { dataset_id: string; [k: string]: any };
}

export async function postJSON<T>(url: string, body: any, signal?: AbortSignal): Promise<T> {
  const resp = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Request failed ${resp.status}: ${text}`);
  }
  return resp.json();
}

export async function uploadFiles(form: FormData, signal?: AbortSignal): Promise<UploadResponse> {
  const resp = await fetch(`${API_BASE}/datasets/upload`, {
    method: 'POST',
    body: form,
    signal
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Upload failed ${resp.status}: ${text}`);
  }
  return resp.json();
}



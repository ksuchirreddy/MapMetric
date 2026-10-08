const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const detail = errorData.detail;
      const msg = typeof detail === 'object' ? detail.message : detail || errorData.message || `HTTP Error ${res.status}`;
      throw new Error(msg);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`MapMetric API Request failed for ${endpoint}:`, err);
    throw err;
  }
}

export interface HealthResponse {
  status: string;
  database?: string;
}

export interface FileRecordItem {
  id: string;
  filename: string;
  file_type?: string;
  feature_count: number;
  crs: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at?: string;
  updated_at?: string;
  processing_time_ms?: number | null;
  error_code?: string | null;
  error_message?: string | null;
}

export interface MeasurementItem {
  feature_id: number;
  geometry_type: string | null;
  measurement_type: 'area' | 'length' | null;
  value: number | null;
  unit: string | null;
  status: 'OK' | 'REPAIRED' | 'NULL_GEOMETRY' | 'EMPTY_GEOMETRY' | 'INVALID_GEOMETRY' | 'UNSUPPORTED_GEOMETRY' | 'TRANSFORM_ERROR';
  error_message: string | null;
  properties: Record<string, any> | null;
}

export interface MeasurementsResponse {
  file_id: string;
  total: number;
  measurements: MeasurementItem[];
}

export const api = {
  getHealth: () => request<HealthResponse>('/health'),
  
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<FileRecordItem>('/api/files/', {
      method: 'POST',
      body: formData,
    });
  },

  listFiles: (limit = 50, offset = 0) =>
    request<FileRecordItem[]>(`/api/files/list?limit=${limit}&offset=${offset}`),

  getFileDetail: (fileId: string) =>
    request<FileRecordItem>(`/api/files/${fileId}/`),

  getMeasurements: (fileId: string, includeProperties = true, limit?: number, offset = 0) => {
    const params = new URLSearchParams({
      include_properties: String(includeProperties),
      offset: String(offset),
    });
    if (limit) params.append('limit', String(limit));
    return request<MeasurementsResponse>(`/api/files/${fileId}/measurements/?${params.toString()}`);
  },
};

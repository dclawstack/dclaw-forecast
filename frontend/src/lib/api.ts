const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(`API error ${response.status}: ${error}`, response.status);
  }
  return response.json();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DataPoint {
  id: string;
  data_series_id: string;
  date: string;
  value: number;
  created_at: string;
}

export interface DataSeries {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  data_type: string;
  created_at: string;
  updated_at: string;
  data_points: DataPoint[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ForecastPoint {
  id: string;
  forecast_id: string;
  date: string;
  value: number;
  lower_bound: number;
  upper_bound: number;
}

export interface Forecast {
  id: string;
  data_series_id: string | null;
  name: string;
  model_type: string;
  horizon_months: number;
  status: string;
  mape: number | null;
  created_at: string;
  updated_at: string;
  forecast_points: ForecastPoint[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string | null;
  base_forecast_id: string | null;
  assumptions: Record<string, unknown> | null;
  adjustment_pct: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  context_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  suggestions: string[];
}

export interface DashboardStats {
  total_data_series: number;
  total_forecasts: number;
  total_scenarios: number;
  completed_forecasts: number;
  avg_mape: number | null;
  recent_forecasts: Array<{
    id: string;
    name: string;
    model_type: string;
    status: string;
    mape: number | null;
    horizon_months: number;
    created_at: string;
  }>;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function getHealth() {
  return fetchJson<{ status: string }>("/health/");
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboard(): Promise<DashboardStats> {
  return fetchJson("/api/v1/dashboard");
}

// ─── Data Series ─────────────────────────────────────────────────────────────

export async function listDataSeries(limit = 20, offset = 0): Promise<Paginated<DataSeries>> {
  return fetchJson(`/api/v1/data-series?limit=${limit}&offset=${offset}`);
}

export async function createDataSeries(body: {
  name: string;
  description?: string;
  unit?: string;
  data_type?: string;
}): Promise<DataSeries> {
  return fetchJson("/api/v1/data-series", { method: "POST", body: JSON.stringify(body) });
}

export async function getDataSeries(id: string): Promise<DataSeries> {
  return fetchJson(`/api/v1/data-series/${id}`);
}

export async function deleteDataSeries(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/data-series/${id}`, { method: "DELETE" });
}

export async function addDataPoints(
  seriesId: string,
  points: Array<{ date: string; value: number }>
): Promise<DataPoint[]> {
  return fetchJson(`/api/v1/data-series/${seriesId}/points`, {
    method: "POST",
    body: JSON.stringify({ data_points: points }),
  });
}

export async function getDataPoints(seriesId: string): Promise<DataPoint[]> {
  return fetchJson(`/api/v1/data-series/${seriesId}/points`);
}

export async function analyzeSeries(seriesId: string) {
  return fetchJson<{ summary: Record<string, unknown>; seasonality: Record<string, unknown> }>(
    `/api/v1/data-series/${seriesId}/analyze`
  );
}

// ─── Forecasts ───────────────────────────────────────────────────────────────

export async function listForecasts(limit = 20, offset = 0): Promise<Paginated<Forecast>> {
  return fetchJson(`/api/v1/forecasts?limit=${limit}&offset=${offset}`);
}

export async function runForecast(body: {
  data_series_id: string;
  model_type?: string;
  horizon_months?: number;
  name?: string;
}): Promise<Forecast> {
  return fetchJson("/api/v1/forecasts/run", { method: "POST", body: JSON.stringify(body) });
}

export async function getForecast(id: string): Promise<Forecast> {
  return fetchJson(`/api/v1/forecasts/${id}`);
}

export async function deleteForecast(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/forecasts/${id}`, { method: "DELETE" });
}

// ─── Scenarios ───────────────────────────────────────────────────────────────

export async function listScenarios(limit = 20, offset = 0): Promise<Paginated<Scenario>> {
  return fetchJson(`/api/v1/scenarios?limit=${limit}&offset=${offset}`);
}

export async function createScenario(body: {
  name: string;
  description?: string;
  base_forecast_id?: string;
  assumptions?: Record<string, unknown>;
  adjustment_pct?: number;
  status?: string;
}): Promise<Scenario> {
  return fetchJson("/api/v1/scenarios", { method: "POST", body: JSON.stringify(body) });
}

export async function getScenario(id: string): Promise<Scenario> {
  return fetchJson(`/api/v1/scenarios/${id}`);
}

export async function updateScenario(
  id: string,
  body: Partial<{ name: string; description: string; adjustment_pct: number; status: string; assumptions: Record<string, unknown> }>
): Promise<Scenario> {
  return fetchJson(`/api/v1/scenarios/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteScenario(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/scenarios/${id}`, { method: "DELETE" });
}

export async function getScenarioResult(id: string) {
  return fetchJson<{ scenario: Scenario; adjusted_points: Array<{ date: string; value: number; lower_bound: number; upper_bound: number }> }>(
    `/api/v1/scenarios/${id}/result`
  );
}

// ─── AI Copilot ──────────────────────────────────────────────────────────────

export async function sendChatMessage(body: {
  session_id: string;
  message: string;
  context?: Record<string, unknown>;
}): Promise<ChatResponse> {
  return fetchJson("/api/v1/ai/forecast-chat", { method: "POST", body: JSON.stringify(body) });
}

export async function getChatHistory(sessionId: string): Promise<{ session_id: string; messages: ChatMessage[] }> {
  return fetchJson(`/api/v1/ai/forecast-chat/${sessionId}/history`);
}

export { ApiError };

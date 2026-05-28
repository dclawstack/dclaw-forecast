"use client";

import { useEffect, useState } from "react";
import { Play, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listDataSeries, listForecasts, runForecast, getForecast, deleteForecast, type Forecast, type DataSeries } from "@/lib/api";

const MODEL_TYPES = ["ensemble", "linear", "ets", "auto"];
const HORIZONS = [3, 6, 12, 24];

function statusColor(status: string) {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    running: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

function RunDialog({ series, onRun }: { series: DataSeries[]; onRun: (f: Forecast) => void }) {
  const [open, setOpen] = useState(false);
  const [seriesId, setSeriesId] = useState("");
  const [modelType, setModelType] = useState("ensemble");
  const [horizon, setHorizon] = useState(12);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    if (!seriesId) return;
    setRunning(true);
    const fc = await runForecast({ data_series_id: seriesId, model_type: modelType, horizon_months: horizon });
    onRun(fc);
    setRunning(false);
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Play className="w-4 h-4 mr-1" /> Run Forecast
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Run New Forecast</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Data Series</label>
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Select series…</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.data_points.length} pts)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Model</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {MODEL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Horizon (months)</label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {HORIZONS.map((h) => <option key={h} value={h}>{h} months</option>)}
              </select>
            </div>
            <Button onClick={handleRun} disabled={!seriesId || running}>
              {running ? "Starting…" : "Run"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ForecastRow({ forecast, onDelete }: { forecast: Forecast; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [refreshed, setRefreshed] = useState<Forecast>(forecast);

  async function refresh() {
    const fc = await getForecast(forecast.id);
    setRefreshed(fc);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{refreshed.name}</CardTitle>
            <CardDescription>
              {refreshed.model_type} · {refreshed.horizon_months}m ·{" "}
              {new Date(refreshed.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {refreshed.mape != null && (
              <span className="text-xs text-slate-500">MAPE {refreshed.mape}%</span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor(refreshed.status)}`}>
              {refreshed.status}
            </span>
            {refreshed.status === "running" || refreshed.status === "pending" ? (
              <Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              disabled={refreshed.forecast_points.length === 0}
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && refreshed.forecast_points.length > 0 && (
        <CardContent>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="text-left py-1 pr-4">Date</th>
                  <th className="text-right py-1 pr-4">Forecast</th>
                  <th className="text-right py-1 pr-4">Lower</th>
                  <th className="text-right py-1">Upper</th>
                </tr>
              </thead>
              <tbody>
                {refreshed.forecast_points.map((pt) => (
                  <tr key={pt.id} className="border-b border-slate-50">
                    <td className="py-1 pr-4">{pt.date}</td>
                    <td className="py-1 pr-4 text-right font-medium">{pt.value.toFixed(1)}</td>
                    <td className="py-1 pr-4 text-right text-slate-400">{pt.lower_bound.toFixed(1)}</td>
                    <td className="py-1 text-right text-slate-400">{pt.upper_bound.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [series, setSeries] = useState<DataSeries[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [fc, sr] = await Promise.all([listForecasts(), listDataSeries()]);
    setForecasts(fc.items);
    setSeries(sr.items);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    await deleteForecast(id);
    setForecasts((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Forecasts</h1>
          <p className="text-sm text-slate-500">Multi-model time-series forecasting with confidence intervals</p>
        </div>
        <RunDialog series={series} onRun={(f) => setForecasts((prev) => [f, ...prev])} />
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : forecasts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400 text-sm">
            No forecasts yet. Add data series first, then click <strong>Run Forecast</strong>.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {forecasts.map((f) => (
            <ForecastRow key={f.id} forecast={f} onDelete={() => handleDelete(f.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

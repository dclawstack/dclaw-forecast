"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Upload, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  listDataSeries, createDataSeries, deleteDataSeries, addDataPoints, analyzeSeries,
  type DataSeries,
} from "@/lib/api";

function AddSeriesDialog({ onCreated }: { onCreated: (s: DataSeries) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("units");
  const [dataType, setDataType] = useState("demand");

  async function handleCreate() {
    const s = await createDataSeries({ name, unit, data_type: dataType });
    onCreated(s);
    setOpen(false);
    setName("");
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" /> New Series
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Data Series</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electronics Demand" />
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="units, revenue, headcount" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="demand">Demand</option>
                <option value="revenue">Revenue</option>
                <option value="headcount">Headcount</option>
              </select>
            </div>
            <Button onClick={handleCreate} disabled={!name}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SampleImporter({ seriesId, onImported }: { seriesId: string; onImported: () => void }) {
  async function handleSample() {
    const points = Array.from({ length: 24 }, (_, i) => {
      const year = 2022 + Math.floor(i / 12);
      const month = (i % 12) + 1;
      return {
        date: `${year}-${String(month).padStart(2, "0")}-01`,
        value: Math.round(100 + Math.random() * 50 + i * 2 + Math.sin(i / 6 * Math.PI) * 20),
      };
    });
    await addDataPoints(seriesId, points);
    onImported();
  }
  return (
    <Button variant="outline" size="sm" onClick={handleSample}>
      <Upload className="w-3 h-3 mr-1" /> Load Sample Data
    </Button>
  );
}

export default function DataPage() {
  const [series, setSeries] = useState<DataSeries[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [analysingId, setAnalysingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await listDataSeries();
    setSeries(res.items);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    await deleteDataSeries(id);
    setSeries((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleAnalyze(id: string) {
    setAnalysingId(id);
    const res = await analyzeSeries(id);
    setAnalysis(res as unknown as Record<string, unknown>);
    setAnalysingId(null);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Data Series</h1>
          <p className="text-sm text-slate-500">Manage time-series data for forecasting</p>
        </div>
        <AddSeriesDialog onCreated={(s) => setSeries((prev) => [s, ...prev])} />
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : series.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400 text-sm">
            No data series yet. Create one to start forecasting.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {series.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{s.data_type}</Badge>
                    <Badge variant="outline">{s.data_points.length} pts</Badge>
                  </div>
                </div>
                <CardDescription>{s.unit}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <SampleImporter seriesId={s.id} onImported={load} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze(s.id)}
                    disabled={analysingId === s.id || s.data_points.length === 0}
                  >
                    <BarChart2 className="w-3 h-3 mr-1" />
                    {analysingId === s.id ? "Analyzing…" : "Analyze"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Summary</p>
                {Object.entries((analysis as { summary: Record<string, unknown> }).summary || {}).map(([k, v]) => (
                  <p key={k} className="text-slate-500"><span className="font-medium capitalize">{k}:</span> {String(v)}</p>
                ))}
              </div>
              <div>
                <p className="font-medium mb-1">Seasonality</p>
                {Object.entries((analysis as { seasonality: Record<string, unknown> }).seasonality || {}).map(([k, v]) => (
                  <p key={k} className="text-slate-500"><span className="font-medium capitalize">{k}:</span> {String(v)}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

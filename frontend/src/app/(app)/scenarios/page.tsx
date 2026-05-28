"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  listScenarios, createScenario, updateScenario, deleteScenario, getScenarioResult,
  listForecasts,
  type Scenario, type Forecast,
} from "@/lib/api";

function CreateDialog({ forecasts, onCreated }: { forecasts: Forecast[]; onCreated: (s: Scenario) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [forecastId, setForecastId] = useState("");
  const [adjustment, setAdjustment] = useState(0);

  async function handleCreate() {
    const sc = await createScenario({
      name,
      description: description || undefined,
      base_forecast_id: forecastId || undefined,
      adjustment_pct: adjustment,
      status: "draft",
    });
    onCreated(sc);
    setOpen(false);
    setName("");
    setDescription("");
    setForecastId("");
    setAdjustment(0);
  }

  const completedForecasts = forecasts.filter((f) => f.status === "completed");

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" /> New Scenario
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Scenario</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Optimistic +10%" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="text-sm font-medium">Base Forecast</label>
              <select
                value={forecastId}
                onChange={(e) => setForecastId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">None</option>
                {completedForecasts.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Adjustment % (positive = uplift, negative = reduction)</label>
              <Input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(Number(e.target.value))}
                placeholder="e.g. 10 for +10%"
              />
            </div>
            <Button onClick={handleCreate} disabled={!name}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ScenarioCard({
  scenario,
  onDelete,
}: {
  scenario: Scenario;
  onDelete: () => void;
}) {
  const [result, setResult] = useState<{ adjusted_points: Array<{ date: string; value: number; lower_bound: number; upper_bound: number }> } | null>(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);

  async function loadResult() {
    setLoadingResult(true);
    setResultError(null);
    try {
      const res = await getScenarioResult(scenario.id);
      setResult(res);
    } catch {
      setResultError("Cannot load result — ensure base forecast is completed.");
    } finally {
      setLoadingResult(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{scenario.name}</CardTitle>
            <CardDescription>{scenario.description || "No description"}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={scenario.adjustment_pct >= 0 ? "default" : "destructive"}>
              {scenario.adjustment_pct >= 0 ? "+" : ""}{scenario.adjustment_pct}%
            </Badge>
            <Badge variant="secondary">{scenario.status}</Badge>
            <Button variant="outline" size="sm" onClick={loadResult} disabled={loadingResult}>
              <GitBranch className="w-3 h-3 mr-1" />
              {loadingResult ? "Loading…" : "View Result"}
            </Button>
            <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {resultError && (
        <CardContent>
          <p className="text-xs text-red-500">{resultError}</p>
        </CardContent>
      )}
      {result && (
        <CardContent>
          <p className="text-xs font-medium mb-2 text-slate-500">Adjusted Forecast Points (first 6)</p>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="text-slate-400 border-b">
                  <th className="text-left py-1 pr-4">Date</th>
                  <th className="text-right py-1 pr-4">Adjusted Value</th>
                  <th className="text-right py-1 pr-4">Lower</th>
                  <th className="text-right py-1">Upper</th>
                </tr>
              </thead>
              <tbody>
                {result.adjusted_points.slice(0, 6).map((pt, i) => (
                  <tr key={i} className="border-b border-slate-50">
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

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [sc, fc] = await Promise.all([listScenarios(), listForecasts()]);
    setScenarios(sc.items);
    setForecasts(fc.items);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    await deleteScenario(id);
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Scenarios</h1>
          <p className="text-sm text-slate-500">What-if scenario planning with adjustment multipliers</p>
        </div>
        <CreateDialog forecasts={forecasts} onCreated={(s) => setScenarios((prev) => [s, ...prev])} />
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : scenarios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400 text-sm">
            No scenarios yet. Create one to model what-if assumptions.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scenarios.map((sc) => (
            <ScenarioCard key={sc.id} scenario={sc} onDelete={() => handleDelete(sc.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Database, GitBranch, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboard, type DashboardStats } from "@/lib/api";

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-teal-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    running: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(() => setError("Unable to reach backend. Is it running?"));
  }, []);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded p-4">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-teal-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">DClaw Forecast</h1>
          <p className="text-sm text-slate-500">AI-powered demand forecasting and scenario planning</p>
        </div>
        <Badge className="ml-auto bg-teal-600 text-white">Operations</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Data Series" value={stats?.total_data_series ?? "—"} icon={<Database className="w-6 h-6" />} />
        <StatCard label="Forecasts" value={stats?.total_forecasts ?? "—"} icon={<TrendingUp className="w-6 h-6" />} />
        <StatCard label="Scenarios" value={stats?.total_scenarios ?? "—"} icon={<GitBranch className="w-6 h-6" />} />
        <StatCard label="Avg MAPE" value={stats?.avg_mape != null ? `${stats.avg_mape}%` : "—"} icon={<CheckCircle className="w-6 h-6" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats || stats.recent_forecasts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No forecasts yet. Go to <strong>Forecasts</strong> to create your first one.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recent_forecasts.map((fc) => (
                <div key={fc.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{fc.name}</p>
                    <p className="text-xs text-slate-400">
                      {fc.model_type} · {fc.horizon_months}m horizon · {new Date(fc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {fc.mape != null && (
                      <span className="text-xs text-slate-500">MAPE {fc.mape}%</span>
                    )}
                    {statusBadge(fc.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

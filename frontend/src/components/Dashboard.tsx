"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DemandForecast {
  id: string;
  product_line: string;
  horizon: string;
  predicted_demand: number;
  confidence_interval: any;
  seasonality_factor: string;
  risk_adjustment: string;
  created_at: string
}

export default function Dashboard() {
  const [productLine, setProductLine] = useState("");
const [horizon, setHorizon] = useState("1mo");
  const [demandForecast, setDemandForecast] = useState<DemandForecast | null>(null);
  const [extraData, setExtraData] = useState<any>(null);
const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!productLine || !horizon) return;
    setLoading(true);
    try {
      const res = await fetch("/forecasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        productLine: productLine,
        horizon: horizon,
        }),
      });
      const data = await res.json();
      setDemandForecast(data);
      const extraRes = await fetch(`/forecasts/${data.id}/history`);
      const extraData = await extraRes.json();
      setExtraData(extraData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8" style={{ color: "#0D9488" }} />
        <div>
          <h1 className="text-2xl font-bold">DClaw Forecast</h1>
          <p className="text-sm text-slate-500">Demand forecasting</p>
        </div>
        <Badge className="ml-auto" style={{ backgroundColor: "#0D9488" }}>Operations</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Forecast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Product line</label>
              <Input value={productLine} onChange={(e) => setProductLine(e.target.value)} placeholder="e.g. Electronics" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Horizon</label>
              <select value={horizon} onChange={(e) => setHorizon(e.target.value)} className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand">
                <option value="1mo">1mo</option><option value="3mo">3mo</option><option value="6mo">6mo</option><option value="1yr">1yr</option>
              </select>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={loading || !productLine || !horizon}>
            {loading ? "Processing..." : "Generate Forecast"}
          </Button>
        </CardContent>
      </Card>

      {demandForecast && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Card>
            <CardHeader>
              <CardTitle>Forecast Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>ID:</strong> {demandForecast.id}</p>
              <p><strong>Product Line:</strong> {demandForecast.product_line}</p>
              <p><strong>Horizon:</strong> {demandForecast.horizon}</p>
              <p><strong>Predicted Demand:</strong> {demandForecast.predicted_demand.toLocaleString()}</p>
              <p><strong>Confidence Interval:</strong> {`${demandForecast.confidence_interval.lower}x - ${demandForecast.confidence_interval.upper}x`}</p>
              <p><strong>Seasonality Factor:</strong> {demandForecast.seasonality_factor}</p>
              <p><strong>Risk Adjustment:</strong> {demandForecast.risk_adjustment}</p>
              <p><strong>Created:</strong> {new Date(demandForecast.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Historical Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {extraData?.map((rec: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">{rec.month}</span>
                    <Badge variant="secondary">{rec.demand.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

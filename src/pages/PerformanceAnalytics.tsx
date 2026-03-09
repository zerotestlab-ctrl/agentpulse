/**
 * AgentPulse — Performance Analytics Page
 * Multi-chart analytics. Works with demo data; live data after refresh.
 */
import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { useApp } from "@/contexts/AppContext";
import { buildDailyTimeSeries, buildFailureBreakdown } from "@/lib/covalent";
import { buildDemoTimeSeries, DEMO_FAILURE_REASONS, DEMO_AGENTS } from "@/lib/demoData";
import { exportToCsv } from "@/lib/exportCsv";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background-elevated border border-border rounded-xl px-3 py-2.5 text-xs shadow-card-elevated space-y-0.5">
      <p className="text-foreground-muted mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          {p.name?.includes("Rate") || p.name?.includes("%") ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

const FAILURE_COLORS = [
  "hsl(0,84%,60%)", "hsl(38,100%,55%)",
  "hsl(258,90%,66%)", "hsl(182,100%,45%)",
  "hsl(142,76%,48%)", "hsl(215,20%,50%)",
];

export default function PerformanceAnalytics() {
  const { allTxs, metricsMap, isLoading, isLiveMode, chain } = useApp();
  const metrics = Object.values(metricsMap);

  // Use live data if available, else demo data
  const timeSeries = useMemo(() => {
    if (isLiveMode && allTxs.length > 0) return buildDailyTimeSeries(allTxs, 14);
    const topDemo = DEMO_AGENTS.filter(a => a.chain === chain)[0];
    return topDemo ? buildDemoTimeSeries(topDemo.successRate, 14) : buildDemoTimeSeries(91, 14);
  }, [allTxs, isLiveMode, chain]);

  const failureBreakdown = useMemo(() => {
    if (isLiveMode && allTxs.length > 0) return buildFailureBreakdown(allTxs);
    return DEMO_FAILURE_REASONS;
  }, [allTxs, isLiveMode]);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Performance Analytics</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Daily trends, gas efficiency, and failure analysis
            {!isLiveMode && <span className="ml-2 text-[11px] text-warning">· Showing demo data</span>}
          </p>
        </div>
      </div>

      {/* Demo notice */}
      {!isLiveMode && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-warning/5 border border-warning/15 text-xs text-warning/80">
          <Info size={12} className="flex-shrink-0" />
          <span>Demo data shown. Add your GoldRush API key and click Refresh Data to load live analytics.</span>
        </div>
      )}

      {/* Success rate chart */}
      <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-foreground">Daily Success Rate — 14 Day Trend</h3>
            <p className="text-xs text-foreground-muted mt-0.5">Overall agent success % over time</p>
          </div>
          <Button variant="ghost" size="sm"
            onClick={() => exportToCsv(timeSeries as any, "performance_timeseries")}
            className="text-foreground-muted gap-1.5 h-7 text-xs">
            <Download size={11} /> CSV
          </Button>
        </div>
        {isLoading ? (
          <div className="h-64 bg-background-elevated rounded-xl animate-shimmer" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={timeSeries} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,12%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,55%)" }} />
              <Line type="monotone" dataKey="successRate" name="Success Rate %"
                stroke="hsl(182,100%,45%)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gas efficiency */}
      <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-foreground">Gas Efficiency (USD per success tx)</h3>
            <p className="text-xs text-foreground-muted mt-0.5">Lower is better</p>
          </div>
        </div>
        {isLoading ? (
          <div className="h-52 bg-background-elevated rounded-xl animate-shimmer" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeries} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,12%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="gasUsd" name="Avg Gas USD"
                stroke="hsl(38,100%,55%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Failure charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Failure Breakdown</h3>
              <p className="text-xs text-foreground-muted mt-0.5">Count by revert reason</p>
            </div>
            <Button variant="ghost" size="sm"
              onClick={() => exportToCsv(failureBreakdown.map(f => ({
                reason: f.reason, count: f.count, gas_wasted: (f as any).gasWasted?.toFixed(4) ?? "0"
              })), "failure_breakdown")}
              className="text-foreground-muted gap-1.5 h-7 text-xs">
              <Download size={11} /> CSV
            </Button>
          </div>
          {isLoading ? (
            <div className="h-52 bg-background-elevated rounded-xl animate-shimmer" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={failureBreakdown} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,12%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="reason" tick={{ fontSize: 9, fill: "hsl(0,0%,55%)" }}
                  tickLine={false} axisLine={false} width={115} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Failures" radius={[0, 4, 4, 0]}>
                  {failureBreakdown.map((_, i) => (
                    <Cell key={i} fill={FAILURE_COLORS[i % FAILURE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground">Gas Wasted by Failure (USD)</h3>
            <p className="text-xs text-foreground-muted mt-0.5">Total gas cost in failed transactions</p>
          </div>
          {isLoading ? (
            <div className="h-52 bg-background-elevated rounded-xl animate-shimmer" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={failureBreakdown.map(f => ({ reason: f.reason, gasWasted: parseFloat(((f as any).gasWasted ?? 0).toFixed(2)) }))}
                layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,12%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="reason" tick={{ fontSize: 9, fill: "hsl(0,0%,55%)" }}
                  tickLine={false} axisLine={false} width={115} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="gasWasted" name="Gas Wasted USD" radius={[0, 4, 4, 0]}>
                  {failureBreakdown.map((_, i) => (
                    <Cell key={i} fill={FAILURE_COLORS[i % FAILURE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Agent summary table */}
      <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-foreground">Agent Performance Summary</h3>
          <Button variant="ghost" size="sm"
            onClick={() => exportToCsv(metrics.map(m => ({
              agent: m.name, address: m.address, chain: m.chain, framework: m.framework,
              tx_count: m.txCount, success_count: m.successCount, fail_count: m.failCount,
              success_rate_pct: m.successRate.toFixed(2), avg_gas_usd: m.avgGasUsd.toFixed(4),
            })), "agent_performance")}
            className="text-foreground-muted gap-1.5 h-7 text-xs">
            <Download size={11} /> Export CSV
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-background-elevated rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-foreground-subtle text-[10px] uppercase tracking-wider">
                  {["Agent", "Tx Count", "Success", "Fail", "Rate", "Avg Gas $", "24h Txs"].map(h => (
                    <th key={h} className={`pb-2.5 font-semibold ${h === "Agent" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.address} className="border-b border-border/40 table-row-hover">
                    <td className="py-3 pr-3 font-medium text-foreground">{m.name}</td>
                    <td className="text-right py-3 text-foreground">{m.txCount.toLocaleString()}</td>
                    <td className="text-right py-3 text-success">{m.successCount.toLocaleString()}</td>
                    <td className="text-right py-3 text-destructive">{m.failCount}</td>
                    <td className="text-right py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        m.successRate >= 90 ? "badge-success" : m.successRate >= 70 ? "badge-warning" : "badge-error"
                      }`}>{m.successRate.toFixed(1)}%</span>
                    </td>
                    <td className="text-right py-3 text-foreground-muted">
                      {m.avgGasUsd > 0 ? `$${m.avgGasUsd.toFixed(4)}` : "—"}
                    </td>
                    <td className="text-right py-3 text-foreground-muted">{m.last24hTxCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

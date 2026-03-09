/**
 * Agentpuls — Cross-Chain Benchmarks
 * Bar charts comparing metrics. Works with demo data instantly.
 */
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useApp } from "@/contexts/AppContext";
import { CHAIN_LABELS, CHAIN_COLORS, FRAMEWORK_COLORS, type SupportedChain } from "@/lib/agents";
import { exportToCsv } from "@/lib/exportCsv";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background-elevated border border-border rounded-xl px-3 py-2.5 text-xs shadow-card-elevated space-y-0.5">
      <p className="text-foreground-muted mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill || p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          {p.name?.includes("Rate") ? "%" : p.name?.includes("Gas") ? " USD" : ""}
        </p>
      ))}
    </div>
  );
};

const CHAIN_COLOR_LIST = [
  CHAIN_COLORS["base-mainnet"],
  CHAIN_COLORS["eth-mainnet"],
  CHAIN_COLORS["avalanche-mainnet"],
];

export default function CrossChainBenchmarks() {
  const { metricsMap, isLoading, isLiveMode } = useApp();
  const metrics = Object.values(metricsMap);

  const chainData = useMemo(() => {
    const chains = ["base-mainnet", "eth-mainnet", "avalanche-mainnet"] as SupportedChain[];
    return chains.map(c => {
      const cm = metrics.filter(m => m.chain === c);
      const totalTx = cm.reduce((a, m) => a + m.txCount, 0);
      const totalSuccess = cm.reduce((a, m) => a + m.successCount, 0);
      const gasValues = cm.filter(m => m.avgGasUsd > 0).map(m => m.avgGasUsd);
      const avgGas = gasValues.length > 0 ? gasValues.reduce((a, b) => a + b, 0) / gasValues.length : 0;
      return {
        chain: CHAIN_LABELS[c], chainId: c,
        agentCount: cm.length,
        txCount: totalTx,
        successRate: totalTx > 0 ? parseFloat(((totalSuccess / totalTx) * 100).toFixed(1)) : 0,
        avgGasUsd: parseFloat(avgGas.toFixed(4)),
      };
    });
  }, [metrics]);

  const frameworkData = useMemo(() => {
    const frameworks = ["Virtuals", "elizaOS", "Clanker", "Custom", "Unknown"] as const;
    return frameworks.map(f => {
      const fm = metrics.filter(m => m.framework === f);
      if (!fm.length) return null;
      const totalTx = fm.reduce((a, m) => a + m.txCount, 0);
      const totalSuccess = fm.reduce((a, m) => a + m.successCount, 0);
      const gasValues = fm.filter(m => m.avgGasUsd > 0).map(m => m.avgGasUsd);
      const avgGas = gasValues.length > 0 ? gasValues.reduce((a, b) => a + b, 0) / gasValues.length : 0;
      return {
        framework: f, agentCount: fm.length, txCount: totalTx,
        successRate: totalTx > 0 ? parseFloat(((totalSuccess / totalTx) * 100).toFixed(1)) : 0,
        avgGasUsd: parseFloat(avgGas.toFixed(4)),
      };
    }).filter(Boolean) as Array<{ framework: string; agentCount: number; txCount: number; successRate: number; avgGasUsd: number }>;
  }, [metrics]);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Cross-Chain Benchmarks</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Compare agent performance across chains and frameworks
          {!isLiveMode && <span className="ml-2 text-[11px] text-warning">· Demo data</span>}
        </p>
      </div>

      {!isLiveMode && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-warning/5 border border-warning/15 text-xs text-warning/80">
          <Info size={12} className="flex-shrink-0" />
          <span>Demo data shown. Add your GoldRush API key and click Refresh Data for live cross-chain comparison.</span>
        </div>
      )}

      {/* Chain comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Success Rate by Chain</h3>
              <p className="text-xs text-foreground-muted mt-0.5">% successful transactions</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => exportToCsv(chainData as any, "chain_benchmarks")}
              className="text-foreground-muted gap-1.5 h-7 text-xs">
              <Download size={11} /> CSV
            </Button>
          </div>
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chainData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,12%)" vertical={false} />
                <XAxis dataKey="chain" tick={{ fontSize: 11, fill: "hsl(0,0%,55%)" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="successRate" name="Success Rate" radius={[4, 4, 0, 0]}>
                  {chainData.map((_, i) => <Cell key={i} fill={CHAIN_COLOR_LIST[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground">Avg Gas Cost by Chain (USD)</h3>
            <p className="text-xs text-foreground-muted mt-0.5">Per successful transaction</p>
          </div>
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chainData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,12%)" vertical={false} />
                <XAxis dataKey="chain" tick={{ fontSize: 11, fill: "hsl(0,0%,55%)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgGasUsd" name="Avg Gas USD" radius={[4, 4, 0, 0]}>
                  {chainData.map((_, i) => <Cell key={i} fill={CHAIN_COLOR_LIST[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Framework comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Success Rate by Framework</h3>
              <p className="text-xs text-foreground-muted mt-0.5">Virtuals, elizaOS, Clanker, Custom</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => exportToCsv(frameworkData as any, "framework_benchmarks")}
              className="text-foreground-muted gap-1.5 h-7 text-xs">
              <Download size={11} /> CSV
            </Button>
          </div>
          {isLoading ? <Skeleton /> : frameworkData.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={frameworkData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,12%)" vertical={false} />
                <XAxis dataKey="framework" tick={{ fontSize: 11, fill: "hsl(0,0%,55%)" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="successRate" name="Success Rate" radius={[4, 4, 0, 0]}>
                  {frameworkData.map(f => (
                    <Cell key={f.framework} fill={FRAMEWORK_COLORS[f.framework as keyof typeof FRAMEWORK_COLORS] ?? "#6B7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground">Transaction Volume by Framework</h3>
            <p className="text-xs text-foreground-muted mt-0.5">Total txs per framework</p>
          </div>
          {isLoading ? <Skeleton /> : frameworkData.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={frameworkData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,12%)" vertical={false} />
                <XAxis dataKey="framework" tick={{ fontSize: 11, fill: "hsl(0,0%,55%)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="txCount" name="Total Txs" radius={[4, 4, 0, 0]}>
                  {frameworkData.map(f => (
                    <Cell key={f.framework} fill={FRAMEWORK_COLORS[f.framework as keyof typeof FRAMEWORK_COLORS] ?? "#6B7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chain summary table */}
      <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
        <h3 className="text-sm font-bold text-foreground mb-5">Chain Summary Table</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-background-elevated rounded-xl animate-shimmer" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-foreground-subtle text-[10px] uppercase tracking-wider">
                  {["Chain", "Agents", "Total Txs", "Success Rate", "Avg Gas USD"].map(h => (
                    <th key={h} className={`pb-2.5 font-semibold ${h === "Chain" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chainData.map((row, i) => (
                  <tr key={row.chainId} className="border-b border-border/40 table-row-hover">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: CHAIN_COLOR_LIST[i] }} />
                        <span className="font-semibold text-foreground">{row.chain}</span>
                      </div>
                    </td>
                    <td className="text-right py-3.5 text-foreground-muted">{row.agentCount}</td>
                    <td className="text-right py-3.5 text-foreground font-medium">{row.txCount.toLocaleString()}</td>
                    <td className="text-right py-3.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        row.successRate >= 90 ? "badge-success" : row.successRate >= 70 ? "badge-warning" : row.successRate > 0 ? "badge-error" : "text-foreground-subtle"
                      }`}>
                        {row.successRate > 0 ? `${row.successRate}%` : "—"}
                      </span>
                    </td>
                    <td className="text-right py-3.5 text-foreground-muted">
                      {row.avgGasUsd > 0 ? `$${row.avgGasUsd}` : "—"}
                    </td>
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

function Skeleton() {
  return <div className="h-52 bg-background-elevated rounded-xl animate-shimmer" />;
}

function EmptyState() {
  return (
    <div className="h-52 flex items-center justify-center text-xs text-foreground-subtle border border-border/30 rounded-xl bg-background-elevated/20">
      No data available
    </div>
  );
}

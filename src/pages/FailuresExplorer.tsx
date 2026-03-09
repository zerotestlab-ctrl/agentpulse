/**
 * Agentpuls — Failures Explorer
 * Detailed failed transactions. Works with demo data; live data after refresh.
 */
import { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { parseFailureReason, type CovalentTx } from "@/lib/covalent";
import { DEMO_FAILURE_REASONS, DEMO_AGENTS } from "@/lib/demoData";
import { shortAddress } from "@/lib/agents";
import { exportToCsv } from "@/lib/exportCsv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, Search, AlertTriangle, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const REASON_OPTIONS = [
  "All", "Execution Reverted", "Slippage Exceeded", "Gas Limit Exceeded",
  "Insufficient Balance", "Nonce Too Low", "Deadline Exceeded", "Access Denied", "Unknown Revert",
];

const REASON_COLOR: Record<string, string> = {
  "Execution Reverted": "badge-error",
  "Slippage Exceeded": "badge-warning",
  "Gas Limit Exceeded": "badge-warning",
  "Insufficient Balance": "badge-error",
  "Nonce Too Low": "badge-info",
  "Deadline Exceeded": "badge-warning",
  "Access Denied": "badge-error",
  "Unknown Revert": "badge-error",
};

interface FailureRow {
  txHash: string;
  agentName: string;
  agentAddress: string;
  chain: string;
  timestamp: string;
  reason: string;
  gasWastedUsd: number;
  gasSpent: number;
  blockUrl: string;
}

const CHAIN_EXPLORER: Record<string, string> = {
  "base-mainnet": "https://basescan.org/tx/",
  "eth-mainnet": "https://etherscan.io/tx/",
  "avalanche-mainnet": "https://snowtrace.io/tx/",
};

export default function FailuresExplorer() {
  const { metricsMap, isLoading, isLiveMode, chain } = useApp();
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("All");

  // Live failures from real txs
  const liveFailures = useMemo((): FailureRow[] => {
    const rows: FailureRow[] = [];
    for (const m of Object.values(metricsMap)) {
      const failedTxs = m.recentTxs.filter(tx => !tx.successful);
      for (const tx of failedTxs) {
        rows.push({
          txHash: tx.tx_hash,
          agentName: m.name,
          agentAddress: m.address,
          chain: m.chain,
          timestamp: tx.block_signed_at,
          reason: parseFailureReason(tx),
          gasWastedUsd: tx.gas_quote ?? 0,
          gasSpent: tx.gas_spent,
          blockUrl: `${CHAIN_EXPLORER[m.chain] ?? ""}${tx.tx_hash}`,
        });
      }
    }
    return rows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [metricsMap]);

  // Demo failures: generate synthetic rows from demo agents
  const demoFailures = useMemo((): FailureRow[] => {
    const now = Date.now();
    const rows: FailureRow[] = [];
    const demoAgents = DEMO_AGENTS.filter(a => a.chain === chain);
    DEMO_FAILURE_REASONS.forEach((f, fi) => {
      for (let i = 0; i < Math.min(f.count > 100 ? 4 : 2, demoAgents.length); i++) {
        const agent = demoAgents[i % demoAgents.length];
        rows.push({
          txHash: `0x${Array.from({ length: 64 }, (_, k) => ((fi * 7 + i * 3 + k) % 16).toString(16)).join("")}`,
          agentName: agent.name,
          agentAddress: agent.address,
          chain: agent.chain,
          timestamp: new Date(now - (fi * 3600000 + i * 900000)).toISOString(),
          reason: f.reason,
          gasWastedUsd: f.gasWasted / f.count,
          gasSpent: 150000 + fi * 20000,
          blockUrl: `${CHAIN_EXPLORER[agent.chain]}0x${"0".repeat(64)}`,
        });
      }
    });
    return rows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [chain]);

  const failures = isLiveMode ? liveFailures : demoFailures;

  const filtered = useMemo(() => {
    let data = failures;
    if (reasonFilter !== "All") data = data.filter(f => f.reason === reasonFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(f =>
        f.txHash.toLowerCase().includes(q) ||
        f.agentName.toLowerCase().includes(q) ||
        f.agentAddress.toLowerCase().includes(q)
      );
    }
    return data;
  }, [failures, reasonFilter, search]);

  const totalGasWasted = useMemo(() => filtered.reduce((a, f) => a + f.gasWastedUsd, 0), [filtered]);

  const formatTs = (ts: string) => {
    try {
      return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return ts; }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Failures Explorer</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Failed transactions with revert reasons, gas wasted, and timestamps
          {!isLiveMode && <span className="ml-2 text-[11px] text-warning">· Demo data</span>}
        </p>
      </div>

      {!isLiveMode && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-warning/5 border border-warning/15 text-xs text-warning/80">
          <Info size={12} className="flex-shrink-0" />
          <span>Showing representative demo failures. Add your GoldRush API key and Refresh Data for real on-chain failures.</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="card-glass rounded-2xl border border-border p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-semibold mb-3">Total Failures</p>
          <p className="text-2xl font-black text-destructive num-ticker">
            {isLoading ? "…" : failures.length.toLocaleString()}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="card-glass rounded-2xl border border-border p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-semibold mb-3">Gas Wasted</p>
          <p className="text-2xl font-black text-warning num-ticker">
            {isLoading ? "…" : `$${totalGasWasted.toFixed(2)}`}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="card-glass rounded-2xl border border-border p-4 sm:p-5 col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-semibold mb-3">Showing</p>
          <p className="text-2xl font-black text-foreground num-ticker">
            {isLoading ? "…" : filtered.length}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card-glass rounded-2xl border border-border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tx hash / agent / address"
              className="pl-7 bg-background-input border-border text-xs h-9 font-mono rounded-xl" />
          </div>
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="bg-background-input border-border text-xs h-9 rounded-xl">
              <SelectValue placeholder="Filter by reason" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-xs">
              {REASON_OPTIONS.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Failures table */}
      <div className="card-glass rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-foreground-muted font-medium">{filtered.length} failures</p>
          <Button variant="ghost" size="sm"
            onClick={() => exportToCsv(filtered.map(f => ({
              tx_hash: f.txHash, agent_name: f.agentName, agent_address: f.agentAddress,
              chain: f.chain, timestamp: f.timestamp, failure_reason: f.reason,
              gas_wasted_usd: f.gasWastedUsd.toFixed(6), gas_spent: f.gasSpent,
            })), "failures_explorer")}
            className="text-foreground-muted gap-1.5 h-7 text-xs">
            <Download size={11} /> Export CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-background-elevated rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <CheckCircle2 size={28} className="text-success mx-auto" />
            <p className="text-sm text-foreground-muted">
              {failures.length === 0 ? "No failures detected!" : "No results match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[520px]">
              <thead>
                <tr className="border-b border-border text-foreground-subtle text-[10px] uppercase tracking-wider">
                  <th className="text-left pb-2.5 font-semibold">Time</th>
                  <th className="text-left pb-2.5 font-semibold">Agent</th>
                  <th className="text-left pb-2.5 font-semibold hidden sm:table-cell">Tx Hash</th>
                  <th className="text-left pb-2.5 font-semibold">Reason</th>
                  <th className="text-right pb-2.5 font-semibold">Gas Wasted</th>
                  <th className="text-right pb-2.5 font-semibold">Link</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.txHash + f.timestamp} className="border-b border-border/40 table-row-hover">
                    <td className="py-3 pr-3 text-foreground-muted whitespace-nowrap">{formatTs(f.timestamp)}</td>
                    <td className="py-3 pr-3 min-w-[120px]">
                      <p className="font-medium text-foreground">{f.agentName}</p>
                      <p className="text-foreground-subtle font-mono text-[10px]">{shortAddress(f.agentAddress)}</p>
                    </td>
                    <td className="py-3 pr-3 hidden sm:table-cell font-mono text-foreground-subtle">
                      {shortAddress(f.txHash)}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${REASON_COLOR[f.reason] ?? "badge-error"}`}>
                        {f.reason}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right text-warning">
                      {f.gasWastedUsd > 0 ? `$${f.gasWastedUsd.toFixed(4)}` : `${f.gasSpent.toLocaleString()} gas`}
                    </td>
                    <td className="py-3 text-right">
                      {f.blockUrl && (
                        <a href={f.blockUrl} target="_blank" rel="noopener noreferrer"
                          className="text-foreground-subtle hover:text-primary transition-colors">
                          <ExternalLink size={11} />
                        </a>
                      )}
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

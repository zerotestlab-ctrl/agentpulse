/**
 * AgentPulse — Global App Context
 *
 * Two-mode system:
 *  - Demo mode: instant static data from demoData.ts (<300ms load)
 *  - Live mode: real GoldRush/Covalent fetches, React Query cached
 *
 * NO auto-refresh. User manually triggers "Load Live Data" or "Refresh".
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { KNOWN_AGENTS, type AgentInfo, type SupportedChain } from "@/lib/agents";
import {
  fetchAllAgentTransactions,
  computeAgentMetrics,
  type AgentMetrics,
  type CovalentTx,
} from "@/lib/covalent";
import { getApiKey, getSelectedChain, setApiKey, setSelectedChain } from "@/lib/storage";
import { buildDemoMetricsMap, DEMO_KPIS, type DemoAgent, DEMO_AGENTS } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";

/** Official GoldRush demo key */
export const DEMO_API_KEY = "cqt_rQpPMkbHM8WDgR6BqGkyc3jfkqFF";

export interface TrackedAgent {
  address: string;
  name: string;
  chain: SupportedChain;
  addedAt: number;
}

const TRACKED_KEY = "agentpulse_tracked_v2";

function getTrackedAgents(): TrackedAgent[] {
  try { return JSON.parse(localStorage.getItem(TRACKED_KEY) ?? "[]"); }
  catch { return []; }
}
function saveTrackedAgents(a: TrackedAgent[]) {
  localStorage.setItem(TRACKED_KEY, JSON.stringify(a));
}

interface AppContextValue {
  // Settings
  apiKey: string;
  isDemo: boolean;
  isLiveMode: boolean;
  setAndSaveApiKey: (k: string) => void;
  chain: SupportedChain;
  setAndSaveChain: (c: SupportedChain) => void;

  // Data state
  agents: AgentInfo[];
  demoAgents: DemoAgent[];
  metricsMap: Record<string, AgentMetrics>;
  allTxs: CovalentTx[];
  isLoading: boolean;
  loadProgress: number;
  error: string | null;
  lastRefreshed: Date | null;
  hasLoaded: boolean;

  // Demo KPIs (always available)
  demoKpis: typeof DEMO_KPIS;

  // Tracked agents
  trackedAgents: TrackedAgent[];
  trackAgent: (a: TrackedAgent) => void;
  untrackAgent: (address: string) => void;
  isTracked: (address: string) => boolean;

  // Actions
  refresh: () => void;
  switchToLiveMode: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const storedKey = getApiKey();
  const [apiKey, setApiKeyState] = useState(storedKey || DEMO_API_KEY);
  const [isDemo, setIsDemo] = useState(!storedKey);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [chain, setChainState] = useState<SupportedChain>(getSelectedChain);

  // Start with demo data pre-loaded for instant render
  const [metricsMap, setMetricsMap] = useState<Record<string, AgentMetrics>>(
    () => buildDemoMetricsMap()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [hasLoaded, setHasLoaded] = useState(true); // demo data counts as loaded
  const [trackedAgents, setTrackedAgents] = useState<TrackedAgent[]>(getTrackedAgents);

  const abortRef = useRef(false);
  const lastRefreshRef = useRef<number>(0);

  const agents = KNOWN_AGENTS.filter((a) => a.chain === chain);
  const demoAgents = DEMO_AGENTS.filter((a) => a.chain === chain);
  const allTxs = Object.values(metricsMap).flatMap((m) => m.recentTxs);

  /** Live data fetch — manual only */
  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < 3_000) return;
    lastRefreshRef.current = now;

    abortRef.current = false;
    setIsLoading(true);
    setError(null);
    setLoadProgress(0);

    try {
      const txMap = await fetchAllAgentTransactions(
        agents,
        apiKey,
        (done, total) => {
          if (!abortRef.current) setLoadProgress(Math.round((done / total) * 100));
        }
      );

      if (abortRef.current) return;

      const newMetrics: Record<string, AgentMetrics> = {};
      for (const agent of agents) {
        newMetrics[agent.address] = computeAgentMetrics(
          agent,
          txMap[agent.address] ?? []
        );
      }

      setMetricsMap(newMetrics);
      setLastRefreshed(new Date());
      setHasLoaded(true);
      setIsLiveMode(true);

      toast({
        title: "Live data loaded",
        description: `Updated ${agents.length} agents on ${chain}`,
        duration: 2500,
      });
    } catch (err) {
      if (!abortRef.current) {
        const msg = err instanceof Error ? err.message : "Unknown fetch error";
        setError(msg);
        toast({ title: "Fetch failed", description: msg, variant: "destructive", duration: 4000 });
      }
    } finally {
      if (!abortRef.current) {
        setIsLoading(false);
        setLoadProgress(100);
      }
    }
  }, [apiKey, agents, chain]);

  /** Switch to live mode and trigger first fetch */
  const switchToLiveMode = useCallback(() => {
    lastRefreshRef.current = 0; // bypass debounce
    refresh();
  }, [refresh]);

  const setAndSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    setApiKeyState(trimmed || DEMO_API_KEY);
    setIsDemo(!trimmed);
    setMetricsMap(buildDemoMetricsMap());
    setHasLoaded(true);
    setIsLiveMode(false);
    lastRefreshRef.current = 0;
    abortRef.current = true;
  };

  const setAndSaveChain = (c: SupportedChain) => {
    setSelectedChain(c);
    setChainState(c);
    setMetricsMap(buildDemoMetricsMap());
    setHasLoaded(true);
    setIsLiveMode(false);
    lastRefreshRef.current = 0;
    abortRef.current = true;
  };

  const trackAgent = (agent: TrackedAgent) => {
    setTrackedAgents((prev) => {
      if (prev.find((a) => a.address === agent.address)) return prev;
      const updated = [...prev, agent];
      saveTrackedAgents(updated);
      return updated;
    });
    toast({ title: "Agent tracked", description: `${agent.name} added to watchlist`, duration: 2000 });
  };

  const untrackAgent = (address: string) => {
    setTrackedAgents((prev) => {
      const updated = prev.filter((a) => a.address !== address);
      saveTrackedAgents(updated);
      return updated;
    });
  };

  const isTracked = (address: string) => trackedAgents.some((a) => a.address === address);

  return (
    <AppContext.Provider
      value={{
        apiKey, isDemo, isLiveMode,
        setAndSaveApiKey,
        chain, setAndSaveChain,
        agents, demoAgents, metricsMap, allTxs,
        isLoading, loadProgress, error,
        lastRefreshed, hasLoaded,
        demoKpis: DEMO_KPIS,
        trackedAgents, trackAgent, untrackAgent, isTracked,
        refresh, switchToLiveMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

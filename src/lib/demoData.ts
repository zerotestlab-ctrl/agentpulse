/**
 * Agentpuls — Static Demo Data
 * Pre-computed realistic on-chain agent metrics for instant <300ms first load.
 * Generated from real patterns seen on Base, Ethereum, and Avalanche.
 */

import type { AgentMetrics, DailyDataPoint } from "./covalent";
import type { SupportedChain } from "./agents";

// ─── Demo agent list (20 agents across chains) ────────────────────────────────

export interface DemoAgent {
  address: string;
  name: string;
  framework: "Virtuals" | "elizaOS" | "Clanker" | "Custom" | "Unknown";
  chain: SupportedChain;
  description: string;
  profileUrl?: string;
  successRate: number;      // 0-100
  volume24h: number;        // USD
  txCount24h: number;
  avgGasUsd: number;
  totalTxCount: number;
  failCount: number;
  rank?: number;
  change24h: number;        // % change in success rate vs yesterday
  tags: string[];
}

export const DEMO_AGENTS: DemoAgent[] = [
  {
    address: "0x1111111254EEB25477B68fb85Ed929f73A960582",
    name: "LUNA Protocol",
    framework: "Virtuals",
    chain: "base-mainnet",
    description: "First Virtuals Protocol agent — cross-chain DeFi automation specialist",
    profileUrl: "https://8004agents.ai/agent/luna",
    successRate: 94.7,
    volume24h: 847230,
    txCount24h: 1284,
    avgGasUsd: 0.0042,
    totalTxCount: 48920,
    failCount: 124,
    rank: 1,
    change24h: +2.3,
    tags: ["DeFi", "Cross-chain", "High-volume"],
  },
  {
    address: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
    name: "Uniswap Universal",
    framework: "Custom",
    chain: "base-mainnet",
    description: "Uniswap Universal Router — the highest-frequency DeFi routing agent on Base",
    profileUrl: "https://app.uniswap.org",
    successRate: 91.2,
    volume24h: 2340000,
    txCount24h: 8932,
    avgGasUsd: 0.0031,
    totalTxCount: 320000,
    failCount: 893,
    rank: 2,
    change24h: -0.5,
    tags: ["AMM", "Routing", "Flagship"],
  },
  {
    address: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    name: "Aerodrome AMM",
    framework: "Virtuals",
    chain: "base-mainnet",
    description: "Aerodrome — the leading AMM and liquidity hub on Base",
    profileUrl: "https://aerodrome.finance",
    successRate: 88.4,
    volume24h: 1120000,
    txCount24h: 3210,
    avgGasUsd: 0.0058,
    totalTxCount: 89000,
    failCount: 542,
    rank: 3,
    change24h: +1.1,
    tags: ["AMM", "Liquidity", "veToken"],
  },
  {
    address: "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5",
    name: "KyberSwap Router",
    framework: "Custom",
    chain: "base-mainnet",
    description: "KyberSwap aggregator with dynamic trade routing across multiple DEXs",
    successRate: 87.9,
    volume24h: 234000,
    txCount24h: 892,
    avgGasUsd: 0.0067,
    totalTxCount: 21000,
    failCount: 210,
    rank: 4,
    change24h: -1.8,
    tags: ["Aggregator", "Multi-DEX"],
  },
  {
    address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    name: "Permit2 Controller",
    framework: "Custom",
    chain: "base-mainnet",
    description: "Uniswap Permit2 — unified token approval and transfer agent",
    successRate: 99.1,
    volume24h: 5820000,
    txCount24h: 14300,
    avgGasUsd: 0.0018,
    totalTxCount: 890000,
    failCount: 44,
    rank: 5,
    change24h: +0.1,
    tags: ["Security", "Approval", "Core"],
  },
  {
    address: "0x20F6fCd6B8813A4D62f5FEa4a3eD1E5EB498D14C",
    name: "Clanker Factory v2",
    framework: "Clanker",
    chain: "base-mainnet",
    description: "Clanker token factory — autonomous meme coin deployment agent",
    profileUrl: "https://clanker.world",
    successRate: 82.3,
    volume24h: 89000,
    txCount24h: 430,
    avgGasUsd: 0.0124,
    totalTxCount: 12400,
    failCount: 340,
    rank: 6,
    change24h: +4.2,
    tags: ["Factory", "Meme", "Token Launcher"],
  },
  {
    address: "0xaE9d2385Ff2E2951Dd4fA065688561b9e72E4688",
    name: "Base Virtuals Hub",
    framework: "Virtuals",
    chain: "base-mainnet",
    description: "Virtuals ecosystem hub — coordinates multi-agent workflows on Base",
    profileUrl: "https://app.virtuals.io",
    successRate: 90.8,
    volume24h: 445000,
    txCount24h: 1820,
    avgGasUsd: 0.0055,
    totalTxCount: 62000,
    failCount: 289,
    rank: 7,
    change24h: +0.9,
    tags: ["Coordination", "Multi-agent"],
  },
  {
    address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    name: "Uniswap V2 Router",
    framework: "elizaOS",
    chain: "eth-mainnet",
    description: "elizaOS-compatible Uniswap V2 routing agent — battle-tested since 2020",
    profileUrl: "https://app.uniswap.org",
    successRate: 93.6,
    volume24h: 3400000,
    txCount24h: 12300,
    avgGasUsd: 0.0089,
    totalTxCount: 2100000,
    failCount: 1230,
    rank: 8,
    change24h: -0.3,
    tags: ["AMM", "Ethereum", "Legacy"],
  },
  {
    address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    name: "SushiSwap Executor",
    framework: "elizaOS",
    chain: "eth-mainnet",
    description: "SushiSwap routing agent with cross-chain bridge capabilities",
    successRate: 86.1,
    volume24h: 780000,
    txCount24h: 3200,
    avgGasUsd: 0.0112,
    totalTxCount: 450000,
    failCount: 1200,
    rank: 9,
    change24h: -2.1,
    tags: ["AMM", "Cross-chain", "Fork"],
  },
  {
    address: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    name: "Uniswap V3 LP Manager",
    framework: "elizaOS",
    chain: "eth-mainnet",
    description: "Automated concentrated liquidity position manager for Uniswap V3",
    successRate: 91.8,
    volume24h: 920000,
    txCount24h: 4100,
    avgGasUsd: 0.0245,
    totalTxCount: 182000,
    failCount: 820,
    rank: 10,
    change24h: +1.4,
    tags: ["LP Management", "V3", "Automation"],
  },
  {
    address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    name: "Uniswap V3 Router",
    framework: "elizaOS",
    chain: "eth-mainnet",
    description: "Core swap routing agent for Uniswap V3 with multi-hop optimization",
    successRate: 92.4,
    volume24h: 4200000,
    txCount24h: 18900,
    avgGasUsd: 0.0198,
    totalTxCount: 3400000,
    failCount: 1890,
    rank: 11,
    change24h: +0.2,
    tags: ["AMM", "Ethereum", "V3"],
  },
  {
    address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    name: "Swap Router 02",
    framework: "Custom",
    chain: "eth-mainnet",
    description: "Next-gen Uniswap swap router with universal permit support",
    successRate: 89.3,
    volume24h: 1800000,
    txCount24h: 7800,
    avgGasUsd: 0.0176,
    totalTxCount: 980000,
    failCount: 780,
    rank: 12,
    change24h: -0.8,
    tags: ["Routing", "Permit", "Ethereum"],
  },
  {
    address: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
    name: "TraderJoe Router",
    framework: "Custom",
    chain: "avalanche-mainnet",
    description: "Leading DEX on Avalanche — advanced liquidity book with dynamic bins",
    profileUrl: "https://traderjoexyz.com",
    successRate: 88.7,
    volume24h: 560000,
    txCount24h: 2900,
    avgGasUsd: 0.0034,
    totalTxCount: 320000,
    failCount: 450,
    rank: 13,
    change24h: +2.8,
    tags: ["AMM", "Avalanche", "Liquidity Book"],
  },
  {
    address: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
    name: "Pangolin AMM",
    framework: "Custom",
    chain: "avalanche-mainnet",
    description: "Community-driven AMM on Avalanche — first DEX to offer liquidity mining",
    successRate: 84.2,
    volume24h: 89000,
    txCount24h: 830,
    avgGasUsd: 0.0028,
    totalTxCount: 98000,
    failCount: 320,
    rank: 14,
    change24h: -3.4,
    tags: ["AMM", "Avalanche", "Community"],
  },
  {
    address: "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901",
    name: "BENQI Lending",
    framework: "Unknown",
    chain: "avalanche-mainnet",
    description: "Algorithmic liquidity market protocol on Avalanche — DeFi lending agent",
    successRate: 97.2,
    volume24h: 340000,
    txCount24h: 1200,
    avgGasUsd: 0.0041,
    totalTxCount: 420000,
    failCount: 98,
    rank: 15,
    change24h: +0.3,
    tags: ["Lending", "Avalanche", "Stable"],
  },
  {
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    name: "WAVAX Wrapper",
    framework: "Custom",
    chain: "avalanche-mainnet",
    description: "Wrapped AVAX canonical bridge — enables ERC-20 compatibility",
    successRate: 99.8,
    volume24h: 1240000,
    txCount24h: 5600,
    avgGasUsd: 0.0009,
    totalTxCount: 1200000,
    failCount: 12,
    rank: 16,
    change24h: 0.0,
    tags: ["Bridge", "Wrapper", "Core"],
  },
  {
    address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    name: "Curve 3Pool Avax",
    framework: "Unknown",
    chain: "avalanche-mainnet",
    description: "Curve stablecoin pool on Avalanche — ultra-low slippage stable swaps",
    successRate: 96.4,
    volume24h: 780000,
    txCount24h: 3400,
    avgGasUsd: 0.0052,
    totalTxCount: 890000,
    failCount: 180,
    rank: 17,
    change24h: +0.8,
    tags: ["Stablecoin", "AMM", "Low-slippage"],
  },
  {
    address: "0x8954AfA98594b838bda56FE4C12a09D7739D179b",
    name: "Platypus Finance",
    framework: "Unknown",
    chain: "avalanche-mainnet",
    description: "Single-side AMM protocol for stablecoins with adaptive slippage model",
    successRate: 79.4,
    volume24h: 34000,
    txCount24h: 240,
    avgGasUsd: 0.0063,
    totalTxCount: 42000,
    failCount: 420,
    rank: 18,
    change24h: -5.1,
    tags: ["Stablecoin", "Single-side"],
  },
  {
    address: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    name: "Balancer Vault",
    framework: "Custom",
    chain: "eth-mainnet",
    description: "Balancer V2 vault — generalized AMM with weighted pools and flash loans",
    successRate: 94.1,
    volume24h: 2800000,
    txCount24h: 9800,
    avgGasUsd: 0.0234,
    totalTxCount: 1800000,
    failCount: 870,
    rank: 19,
    change24h: +1.7,
    tags: ["AMM", "Weighted Pools", "Flash Loans"],
  },
  {
    address: "0xbeefcafe00000000000000000000000000000000",
    name: "Eliza Agent #001",
    framework: "elizaOS",
    chain: "eth-mainnet",
    description: "Community-deployed elizaOS agent — autonomous DeFi strategy executor",
    successRate: 71.8,
    volume24h: 12000,
    txCount24h: 89,
    avgGasUsd: 0.0189,
    totalTxCount: 3400,
    failCount: 820,
    rank: 20,
    change24h: -6.2,
    tags: ["elizaOS", "Autonomous", "Strategy"],
  },
];

// ─── Demo metrics map (pre-built from demo agents) ─────────────────────────────

export function buildDemoMetricsMap(): Record<string, AgentMetrics> {
  const map: Record<string, AgentMetrics> = {};
  for (const a of DEMO_AGENTS) {
    map[a.address] = {
      address: a.address,
      name: a.name,
      chain: a.chain,
      framework: a.framework,
      txCount: a.totalTxCount,
      successCount: Math.round(a.totalTxCount * (a.successRate / 100)),
      failCount: a.failCount,
      successRate: a.successRate,
      avgGasUsd: a.avgGasUsd,
      totalGasUsd: a.avgGasUsd * a.totalTxCount,
      last24hTxCount: a.txCount24h,
      last24hSuccessRate: a.successRate + (Math.random() * 4 - 2),
      recentTxs: generateDemoTxs(a.address, a.successRate, 20),
    };
  }
  return map;
}

/** Generate fake-realistic tx list for demo profiles */
function generateDemoTxs(address: string, successRate: number, count: number) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const successful = Math.random() * 100 < successRate;
    const minsAgo = i * 7 + Math.floor(Math.random() * 5);
    return {
      block_signed_at: new Date(now - minsAgo * 60000).toISOString(),
      tx_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      from_address: address,
      to_address: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      value: String(Math.floor(Math.random() * 1e18)),
      gas_offered: 200000 + Math.floor(Math.random() * 50000),
      gas_spent: 120000 + Math.floor(Math.random() * 40000),
      gas_price: 1e9 + Math.floor(Math.random() * 2e9),
      gas_quote: 0.002 + Math.random() * 0.01,
      gas_quote_rate: 3200,
      fees_paid: String(Math.floor(Math.random() * 1e15)),
      successful,
    };
  });
}

/** Build 14-day sparkline for a demo agent */
export function buildDemoTimeSeries(successRate: number, days = 14): DailyDataPoint[] {
  const result: DailyDataPoint[] = [];
  let current = successRate + (Math.random() * 6 - 3);
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86400000);
    const key = `${date.getMonth() + 1}/${date.getDate()}`;
    const delta = (Math.random() - 0.48) * 3;
    current = Math.min(99.9, Math.max(40, current + delta));
    const txCount = 200 + Math.floor(Math.random() * 400);
    result.push({
      date: key,
      successRate: parseFloat(current.toFixed(1)),
      txCount,
      gasUsd: 0.002 + Math.random() * 0.015,
      failCount: Math.round(txCount * (1 - current / 100)),
    });
  }
  return result;
}

/** Demo KPI totals */
export const DEMO_KPIS = {
  totalTx24h: 89432,
  successRate24h: 91.4,
  avgGasUsd: 0.0087,
  activeAgents: 18,
  totalVolumeUsd: 24800000,
  failedTx24h: 7812,
};

/** Demo failure reasons */
export const DEMO_FAILURE_REASONS = [
  { reason: "Slippage Exceeded", count: 2840, gasWasted: 12.4 },
  { reason: "Gas Limit Exceeded", count: 1920, gasWasted: 8.9 },
  { reason: "Execution Reverted", count: 1540, gasWasted: 6.2 },
  { reason: "Deadline Exceeded", count: 890, gasWasted: 3.8 },
  { reason: "Insufficient Balance", count: 430, gasWasted: 1.9 },
  { reason: "Access Denied", count: 192, gasWasted: 0.8 },
];

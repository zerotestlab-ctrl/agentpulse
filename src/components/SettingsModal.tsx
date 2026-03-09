/**
 * AgentPulse — Settings Modal
 * Clean API key input + chain selection with localStorage persistence.
 * Key is mandatory for live data — demo data works without it.
 */
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { CHAIN_LABELS, type SupportedChain } from "@/lib/agents";
import {
  Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle,
  Info, Trash2, KeyRound, Zap, Shield
} from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const CHAINS: SupportedChain[] = ["base-mainnet", "eth-mainnet", "avalanche-mainnet"];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { apiKey, hasUserKey, setAndSaveApiKey, chain, setAndSaveChain } = useApp();
  const [draft, setDraft] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setAndSaveApiKey(draft);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const handleClear = () => {
    setDraft("");
    setAndSaveApiKey("");
  };

  const keyValid = draft.trim().length > 10;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-background-card border-border shadow-card-elevated">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <KeyRound size={14} className="text-primary" />
            </div>
            Settings
          </DialogTitle>
          <DialogDescription className="text-foreground-muted text-sm">
            Add your free GoldRush API key to unlock live data and refresh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Demo mode notice */}
          {!hasUserKey && (
            <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-primary/5 border border-primary/15 text-xs">
              <Info size={13} className="mt-0.5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-primary">Demo Mode Active</p>
                <p className="text-foreground-muted mt-1 leading-relaxed">
                  Beautiful demo data is shown. Add your own free key below to unlock live on-chain transactions with manual refresh.
                </p>
              </div>
            </div>
          )}

          {/* ─── API Key ─── */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap size={13} className="text-primary" />
              Covalent GoldRush API Key
            </Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="cqt_…  (free — no credit card required)"
                className="bg-background-input border-border pr-20 font-mono text-sm focus:border-primary/60 h-11 rounded-xl"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {draft && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-foreground-subtle hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
                    title="Clear key"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="text-foreground-muted hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-accent/50"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground-muted flex items-center gap-1.5">
                Get free key at{" "}
                <a
                  href="https://www.covalenthq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 font-medium"
                >
                  covalenthq.com <ExternalLink size={10} />
                </a>
              </p>
              {draft && (
                <div className={`flex items-center gap-1 text-xs ${keyValid ? "text-success" : "text-destructive"}`}>
                  {keyValid ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {keyValid ? "Looks valid" : "Too short"}
                </div>
              )}
            </div>
          </div>

          {/* ─── Chain Selection ─── */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-foreground">
              Default Chain
            </Label>
            <div className="flex flex-wrap gap-2">
              {CHAINS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAndSaveChain(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    chain === c
                      ? "bg-primary/10 border-primary/50 text-primary shadow-neon-sm"
                      : "bg-background-input border-border text-foreground-muted hover:border-border-accent/50 hover:text-foreground"
                  }`}
                >
                  {CHAIN_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Privacy note ─── */}
          <div className="rounded-xl bg-background-elevated border border-border p-3.5 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Shield size={12} className="text-primary" /> 100% Client-Side Privacy
            </div>
            <p className="text-foreground-muted leading-relaxed">
              Your API key is stored only in your browser's localStorage. No data is sent to any AgentPulse server — all requests go directly to Covalent.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!draft.trim() && hasUserKey}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-neon-sm font-semibold"
          >
            {saved ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Saved!
              </span>
            ) : (
              "Save Key"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

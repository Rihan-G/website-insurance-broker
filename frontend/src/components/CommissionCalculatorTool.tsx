import { useState } from "react";
import { Calculator } from "lucide-react";
import { estimateCommission } from "../lib/commissionCalculator";

export function CommissionCalculatorTool() {
  const [premium, setPremium] = useState("50000");
  const [rate, setRate] = useState("12.5");
  const [share, setShare] = useState("100");

  const premiumMur = Number(premium) || 0;
  const { grossCommission, brokerNet } = estimateCommission({
    premiumMur,
    commissionRatePct: Number(rate) || 0,
    brokerSharePct: Number(share) || 100,
  });

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
        <Calculator className="h-5 w-5 text-primary-600" aria-hidden />
        Commission estimator
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="text-muted-foreground">Premium (MUR)</span>
          <input type="number" value={premium} onChange={(e) => setPremium(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground">Commission %</span>
          <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground">Your share %</span>
          <input type="number" value={share} onChange={(e) => setShare(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-3 py-2" />
        </label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">Gross commission</p>
          <p className="text-xl font-bold text-surface-foreground">MUR {grossCommission.toLocaleString("en-MU", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-950/40">
          <p className="text-xs text-muted-foreground">Your net</p>
          <p className="text-xl font-bold text-primary-700 dark:text-primary-300">MUR {brokerNet.toLocaleString("en-MU", { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
    </section>
  );
}

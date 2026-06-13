import { useSearchParams } from "react-router-dom";
import { RoleGuard } from "../components/RoleGuard";
import { PerformanceAnalyticsTab } from "./performance/PerformanceAnalyticsTab";
import { PerformanceWorkloadTab } from "./performance/PerformanceWorkloadTab";

type PerformanceTab = "analytics" | "workload";

export function PerformancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: PerformanceTab = searchParams.get("tab") === "workload" ? "workload" : "analytics";

  const setTab = (next: PerformanceTab) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    setSearchParams(params, { replace: true });
  };

  return (
    <RoleGuard allowedRoles={["admin", "broker"]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Performance</h2>
          <p className="text-muted-foreground">Revenue, growth, and broker workload insights</p>
        </div>

        <div className="flex rounded-lg border border-border overflow-hidden w-fit">
          {(
            [
              { id: "analytics", label: "Analytics" },
              { id: "workload", label: "Workload" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors duration-200 ${
                tab === t.id ? "bg-primary-600 text-white" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "analytics" ? <PerformanceAnalyticsTab /> : <PerformanceWorkloadTab />}
      </div>
    </RoleGuard>
  );
}

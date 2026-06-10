import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getSnapshot, () => true);
  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 border-b border-warning-500/30 bg-warning-500/10 px-4 py-2 text-sm font-medium text-warning-800 dark:text-warning-200">
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      You are offline — some portal data may be unavailable.
    </div>
  );
}

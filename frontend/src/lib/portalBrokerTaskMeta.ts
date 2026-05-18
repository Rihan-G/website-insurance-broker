/** Client-side extras for broker_tasks (colour, reminders) until dedicated columns exist. */

const KEY = "sb_broker_task_meta_v1";

export interface BrokerTaskMeta {
  color: string;
  reminderAt: string | null;
  statusChangedAt: string;
}

export type BrokerTaskMetaMap = Record<string, BrokerTaskMeta>;

export function loadBrokerTaskMeta(): BrokerTaskMetaMap {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const v = JSON.parse(raw) as unknown;
    if (typeof v !== "object" || v === null) return {};
    return v as BrokerTaskMetaMap;
  } catch {
    return {};
  }
}

export function saveBrokerTaskMeta(map: BrokerTaskMetaMap): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function upsertBrokerTaskMeta(
  taskId: string,
  patch: Partial<Pick<BrokerTaskMeta, "color" | "reminderAt">> & { touchStatus?: boolean },
): BrokerTaskMetaMap {
  const cur = loadBrokerTaskMeta();
  const prev = cur[taskId] ?? {
    color: "slate",
    reminderAt: null,
    statusChangedAt: new Date().toISOString(),
  };
  const nextEntry: BrokerTaskMeta = {
    ...prev,
    ...patch,
    statusChangedAt: patch.touchStatus ? new Date().toISOString() : prev.statusChangedAt,
  };
  const next = { ...cur, [taskId]: nextEntry };
  saveBrokerTaskMeta(next);
  return next;
}

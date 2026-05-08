import { useState } from "react";
import { Calendar, Info, Globe } from "lucide-react";
import { format, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";

interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  nameKr?: string;
  nameFr?: string;
  type: "public" | "optional" | "religious";
  religions?: string[];
}

// Mauritius public holidays 2026
const MAURITIUS_HOLIDAYS_2026: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day", nameFr: "Jour de l'An", nameKr: "Premye Jou Lanné", type: "public" },
  { date: "2026-01-02", name: "New Year Holiday", nameFr: "Congé de Nouvel An", nameKr: "Vakans Nouvel An", type: "public" },
  { date: "2026-01-12", name: "Liberation Day", nameFr: "Fête de la Libération", nameKr: "Fèt Liberasyon", type: "public" },
  { date: "2026-02-01", name: "Abolition of Slavery Day", nameFr: "Fête de l'Abolition de l'Esclavage", nameKr: "Abolisyon Esklavaz", type: "public" },
  { date: "2026-02-07", name: "Chinese Spring Festival (Approx)", nameFr: "Fête du Printemps Chinois", nameKr: "Fèt Prins Sinwa", type: "optional", religions: ["Chinese"] },
  { date: "2026-02-19", name: "Maha Shivaratri", nameFr: "Maha Shivaratri", nameKr: "Maha Shivaratri", type: "public", religions: ["Hindu"] },
  { date: "2026-03-12", name: "National Day / Independence Day", nameFr: "Fête Nationale", nameKr: "Fèt Nasional", type: "public" },
  { date: "2026-03-20", name: "Ougadi (Telegu New Year)", nameFr: "Ougadi", nameKr: "Ougadi", type: "optional", religions: ["Hindu"] },
  { date: "2026-04-02", name: "Good Friday (Approx)", nameFr: "Vendredi Saint", nameKr: "Vendred Sen", type: "optional", religions: ["Christian"] },
  { date: "2026-04-05", name: "Easter Sunday (Approx)", nameFr: "Pâques", nameKr: "Pak", type: "optional", religions: ["Christian"] },
  { date: "2026-05-01", name: "Labour Day", nameFr: "Fête du Travail", nameKr: "Fèt Travay", type: "public" },
  { date: "2026-06-20", name: "Eid-ul-Fitr (Approx)", nameFr: "Aïd-el-Fitr", nameKr: "Eid-ul-Fitr", type: "public", religions: ["Muslim"] },
  { date: "2026-08-15", name: "Assumption Day", nameFr: "Fête de l'Assomption", nameKr: "Fèt Lassompsion", type: "optional", religions: ["Christian"] },
  { date: "2026-08-27", name: "Eid-ul-Adha (Approx)", nameFr: "Aïd-el-Adha", nameKr: "Eid-ul-Adha", type: "optional", religions: ["Muslim"] },
  { date: "2026-09-10", name: "Ganesh Chaturthi", nameFr: "Ganesh Chaturthi", nameKr: "Ganesh Chaturthi", type: "public", religions: ["Hindu"] },
  { date: "2026-10-20", name: "Diwali (Approx)", nameFr: "Diwali", nameKr: "Divali", type: "public", religions: ["Hindu"] },
  { date: "2026-11-01", name: "All Saints Day", nameFr: "La Toussaint", nameKr: "Toussenn", type: "optional", religions: ["Christian"] },
  { date: "2026-11-02", name: "Arrival of Indentured Labourers Day", nameFr: "Arrivée des Engagés", nameKr: "Arivé Travayer Angazé", type: "public" },
  { date: "2026-12-25", name: "Christmas Day", nameFr: "Noël", nameKr: "Noël", type: "public", religions: ["Christian"] },
  // Extra 2025 holdovers
  { date: "2025-12-25", name: "Christmas Day", nameFr: "Noël", nameKr: "Noël", type: "public" },
];

const typeStyles: Record<string, string> = {
  public: "bg-primary-100 text-primary-700 border-primary-200",
  optional: "bg-amber-50 text-amber-700 border-amber-200",
  religious: "bg-purple-50 text-purple-700 border-purple-200",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HolidayCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [lang, setLang] = useState<"en" | "fr" | "kr">("en");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const allHolidays = MAURITIUS_HOLIDAYS_2026;

  const holidayForDay = (day: Date) => allHolidays.find((h) => isSameDay(new Date(h.date), day));
  const monthHolidays = allHolidays.filter((h) => {
    const d = new Date(h.date);
    return d >= monthStart && d <= monthEnd;
  });

  const getName = (h: Holiday) => lang === "fr" ? (h.nameFr ?? h.name) : lang === "kr" ? (h.nameKr ?? h.name) : h.name;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Mauritius Holiday Calendar</h2>
          <p className="text-muted-foreground">Public & optional holidays — affects payment processing & office hours</p>
        </div>
        <div className="flex gap-2">
          {(["en", "fr", "kr"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${lang === l ? "bg-primary-600 text-white" : "border border-border text-muted-foreground hover:bg-muted"}`}>
              {l === "en" ? "EN" : l === "fr" ? "FR" : "Kreol"}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 flex gap-3">
        <Info className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
        <div className="text-sm text-primary-800">
          <span className="font-medium">Important for clients:</span> Payment links may take longer to process during public holidays.
          Date-sensitive policy renewals are scheduled to the next business day if they fall on a holiday.
        </div>
      </div>

      {/* Calendar navigation */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="rounded-lg border border-border p-2 hover:bg-muted cursor-pointer">‹</button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-surface-foreground">{format(currentMonth, "MMMM yyyy")}</h3>
          </div>
          <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="rounded-lg border border-border p-2 hover:bg-muted cursor-pointer">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>)}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPadding }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const holiday = holidayForDay(day);
            const isToday = isSameDay(day, new Date());
            const isWeekend = [0, 6].includes(getDay(day));
            return (
              <div
                key={day.toISOString()}
                title={holiday ? getName(holiday) : undefined}
                className={`relative rounded-lg p-2 min-h-[48px] text-center text-sm transition-colors cursor-default
                  ${isToday ? "ring-2 ring-primary-500 ring-offset-1" : ""}
                  ${holiday ? (holiday.type === "public" ? "bg-primary-100" : "bg-amber-50") : isWeekend ? "bg-muted/50" : "hover:bg-muted/30"}
                `}
              >
                <span className={`font-medium ${isToday ? "text-primary-700" : holiday ? "text-primary-800" : isWeekend ? "text-muted-foreground" : "text-surface-foreground"}`}>
                  {format(day, "d")}
                </span>
                {holiday && (
                  <div className="mt-0.5 truncate text-[9px] leading-tight text-primary-700 font-medium">
                    {getName(holiday).split(" ").slice(0, 2).join(" ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-primary-100" /> Public Holiday</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-amber-50 border border-amber-200" /> Optional / Religious</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded ring-2 ring-primary-500" /> Today</div>
        </div>
      </div>

      {/* Month holidays list */}
      {monthHolidays.length > 0 ? (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Holidays in {format(currentMonth, "MMMM yyyy")}</h3>
          </div>
          <div className="divide-y divide-border">
            {monthHolidays.map((h) => (
              <div key={h.date} className="flex items-center gap-4 px-6 py-4">
                <div className="text-center shrink-0 w-12">
                  <p className="text-2xl font-bold text-primary-600">{format(new Date(h.date), "d")}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(h.date), "EEE")}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-foreground">{getName(h)}</p>
                  {h.religions && <p className="text-xs text-muted-foreground mt-0.5">{h.religions.join(", ")}</p>}
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${typeStyles[h.type]}`}>
                  {h.type === "public" ? "Public Holiday" : "Optional"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface py-12 text-center">
          <Globe className="mx-auto h-8 w-8 text-muted-foreground opacity-40 mb-2" />
          <p className="text-muted-foreground text-sm">No holidays this month.</p>
        </div>
      )}
    </div>
  );
}

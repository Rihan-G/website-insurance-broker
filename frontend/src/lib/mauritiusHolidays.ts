export interface MauritiusHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  nameKr?: string;
  nameFr?: string;
  type: "public" | "optional" | "religious";
  religions?: string[];
}

/** Mauritius public & optional holidays (reference set — extend as needed). */
export const MAURITIUS_HOLIDAYS: MauritiusHoliday[] = [
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
  { date: "2025-12-25", name: "Christmas Day", nameFr: "Noël", nameKr: "Noël", type: "public", religions: ["Christian"] },
];

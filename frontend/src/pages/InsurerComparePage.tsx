import { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, Shield } from "lucide-react";

type Product = "motor" | "home" | "health" | "business" | "travel" | "life";

type InsurerQuote = {
  insurer: string;
  premium: number;
  excess: number;
  rating: number;
  claimsSpeed: string;
  features: string[];
  exclusions: string[];
  highlight?: string;
};

const QUOTES: Record<Product, InsurerQuote[]> = {
  motor: [
    { insurer: "MUA Ltd", premium: 18500, excess: 15000, rating: 4.5, claimsSpeed: "5–7 days", highlight: "Best overall", features: ["Windscreen cover", "Roadside assistance 24/7", "Courtesy car", "Flood damage included"], exclusions: ["Off-road use", "Racing"] },
    { insurer: "Swan Insurance", premium: 16200, excess: 20000, rating: 4.0, claimsSpeed: "7–10 days", features: ["Windscreen cover", "Roadside assistance", "Flood damage included"], exclusions: ["Courtesy car", "Off-road use"] },
    { insurer: "Mauritius Union", premium: 14800, excess: 25000, rating: 3.8, claimsSpeed: "10–14 days", features: ["Windscreen cover", "Flood damage included"], exclusions: ["Roadside assistance", "Courtesy car", "Off-road use"] },
    { insurer: "Eagle Insurance", premium: 13500, excess: 30000, rating: 3.5, claimsSpeed: "14–21 days", highlight: "Lowest premium", features: ["Windscreen cover"], exclusions: ["Roadside assistance", "Courtesy car", "Flood damage"] },
  ],
  home: [
    { insurer: "Swan Insurance", premium: 12800, excess: 10000, rating: 4.6, claimsSpeed: "5–7 days", highlight: "Best overall", features: ["Cyclone cover", "Flood", "Theft", "Contents included", "Alternative accommodation"], exclusions: ["Earthquake"] },
    { insurer: "MUA Ltd", premium: 11400, excess: 12000, rating: 4.2, claimsSpeed: "7–10 days", features: ["Cyclone cover", "Flood", "Theft"], exclusions: ["Contents (separate policy)", "Alternative accommodation"] },
    { insurer: "Jubilee Insurance", premium: 10200, excess: 15000, rating: 3.9, claimsSpeed: "10–14 days", highlight: "Best value", features: ["Cyclone cover", "Flood"], exclusions: ["Theft", "Contents", "Alternative accommodation"] },
  ],
  health: [
    { insurer: "Jubilee Insurance", premium: 28000, excess: 5000, rating: 4.7, claimsSpeed: "3–5 days", highlight: "Best cover", features: ["Private hospital", "Dental", "Optical", "Maternity", "Emergency evacuation"], exclusions: ["Pre-existing (first 12 months)"] },
    { insurer: "Sicom", premium: 24500, excess: 5000, rating: 4.3, claimsSpeed: "5–7 days", features: ["Private hospital", "Dental", "Maternity"], exclusions: ["Optical", "Emergency evacuation"] },
    { insurer: "Swan Insurance", premium: 22000, excess: 8000, rating: 4.0, claimsSpeed: "7–10 days", highlight: "Lowest premium", features: ["Private hospital", "Dental"], exclusions: ["Optical", "Maternity", "Emergency evacuation"] },
  ],
  business: [
    { insurer: "Mauritius Union", premium: 45000, excess: 20000, rating: 4.4, claimsSpeed: "7–10 days", highlight: "Best for SMEs", features: ["Public liability", "Property", "Business interruption", "Employer's liability", "Cyber cover"], exclusions: ["Directors' liability (separate)"] },
    { insurer: "MUA Ltd", premium: 38000, excess: 25000, rating: 4.1, claimsSpeed: "10–14 days", features: ["Public liability", "Property", "Business interruption"], exclusions: ["Cyber cover", "Employer's liability"] },
    { insurer: "New India Assurance", premium: 32000, excess: 30000, rating: 3.7, claimsSpeed: "14–21 days", highlight: "Lowest premium", features: ["Public liability", "Property"], exclusions: ["Business interruption", "Cyber cover"] },
  ],
  travel: [
    { insurer: "New India Assurance", premium: 4200, excess: 2000, rating: 4.3, claimsSpeed: "3–5 days", highlight: "Best value", features: ["Medical emergency", "Trip cancellation", "Lost baggage", "Flight delay", "Personal liability"], exclusions: ["Adventure sports"] },
    { insurer: "Allianz", premium: 5800, excess: 1000, rating: 4.6, claimsSpeed: "2–3 days", highlight: "Premium pick", features: ["Medical emergency", "Trip cancellation", "Lost baggage", "Flight delay", "Personal liability", "Adventure sports"], exclusions: [] },
    { insurer: "Swan Insurance", premium: 3500, excess: 3000, rating: 3.8, claimsSpeed: "5–7 days", features: ["Medical emergency", "Lost baggage"], exclusions: ["Trip cancellation", "Flight delay", "Adventure sports"] },
  ],
  life: [
    { insurer: "Sicom", premium: 12000, excess: 0, rating: 4.5, claimsSpeed: "7–14 days", highlight: "Most trusted", features: ["Death benefit", "Total permanent disability", "Critical illness rider", "Premium waiver"], exclusions: ["Suicide (first 2 years)"] },
    { insurer: "Jubilee Insurance", premium: 10500, excess: 0, rating: 4.2, claimsSpeed: "7–14 days", features: ["Death benefit", "Total permanent disability", "Critical illness rider"], exclusions: ["Premium waiver"] },
    { insurer: "Mauritius Union", premium: 9200, excess: 0, rating: 4.0, claimsSpeed: "14–21 days", highlight: "Lowest premium", features: ["Death benefit", "Total permanent disability"], exclusions: ["Critical illness", "Premium waiver"] },
  ],
};

const PRODUCTS: { value: Product; label: string }[] = [
  { value: "motor", label: "Motor" },
  { value: "home", label: "Home" },
  { value: "health", label: "Health" },
  { value: "business", label: "Business" },
  { value: "travel", label: "Travel" },
  { value: "life", label: "Life" },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="text-[11px] font-bold text-warning-500">
      {"★".repeat(Math.round(n))}{"☆".repeat(5 - Math.round(n))} {n.toFixed(1)}
    </span>
  );
}

export function InsurerComparePage() {
  const [product, setProduct] = useState<Product>("motor");
  const quotes = QUOTES[product];

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Tools</p>
        <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Insurer comparison</h1>
        <p className="mt-1 text-sm text-muted-foreground">Compare premiums, cover, and claims speed across our panel of insurers.</p>
      </div>

      {/* Product tabs */}
      <div className="flex flex-wrap gap-2">
        {PRODUCTS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setProduct(p.value)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${product === p.value ? "bg-primary-600 text-white shadow-sm" : "border border-border bg-surface text-muted-foreground hover:text-surface-foreground"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Comparison grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quotes.map((q) => (
          <div
            key={q.insurer}
            className={`relative rounded-2xl border bg-surface p-5 space-y-4 ${q.highlight ? "border-primary-400 ring-1 ring-primary-400/30 dark:border-primary-600" : "border-border"}`}
          >
            {q.highlight && (
              <span className="absolute -top-2.5 left-4 rounded-full bg-primary-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                {q.highlight}
              </span>
            )}

            <div className="flex items-start justify-between gap-2 pt-1">
              <div>
                <p className="font-bold text-surface-foreground">{q.insurer}</p>
                <Stars n={q.rating} />
              </div>
              <Shield className="h-6 w-6 shrink-0 text-primary-400" aria-hidden />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Annual premium</p>
                <p className="mt-1 text-xl font-bold text-surface-foreground">MUR {q.premium.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Excess</p>
                <p className="mt-1 text-xl font-bold text-surface-foreground">{q.excess > 0 ? `MUR ${q.excess.toLocaleString()}` : "None"}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Claims speed</p>
              <p className="text-sm font-semibold text-surface-foreground">{q.claimsSpeed}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Included</p>
              {q.features.map((f) => (
                <div key={f} className="flex items-start gap-1.5 text-xs text-surface-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" aria-hidden />
                  {f}
                </div>
              ))}
              {q.exclusions.map((f) => (
                <div key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-border" aria-hidden />
                  {f}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {}}
              className="w-full rounded-xl bg-primary-600 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
            >
              Get formal quote
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Indicative premiums for a standard risk profile. Final premiums depend on your specific details and insurer underwriting. Contact your broker for a formal quotation.</p>
    </div>
  );
}

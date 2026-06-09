import { heroBackgroundPresets, type HeroBgPreset } from "./homeHeroBackgrounds";

export function HomeBackgroundSampler({
  preset,
  onChange,
}: {
  preset: HeroBgPreset;
  onChange: (next: HeroBgPreset) => void;
}) {
  return (
    <div
      className="absolute bottom-6 left-5 right-5 z-20 sm:left-auto sm:right-8 sm:max-w-md"
      role="region"
      aria-label="Hero background style samples"
    >
      <div className="rounded-2xl border border-white/15 bg-slate-950/60 p-3 shadow-lg backdrop-blur-md dark:border-primary-400/20 dark:bg-surface/80">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-200/90 dark:text-primary-200">Background samples</p>
        <p className="mt-0.5 text-xs text-primary-100/75 dark:text-muted-foreground">Slow motion presets. Your choice is saved on this device.</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {heroBackgroundPresets.map((item) => {
            const active = item.id === preset;
            return (
              <button
                key={item.id}
                type="button"
                title={item.desc}
                onClick={() => onChange(item.id)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                  active
                    ? "bg-accent-500 text-white shadow-md shadow-accent-500/30 ring-2 ring-white/25"
                    : "bg-white/10 text-primary-100 hover:bg-white/15"
                }`}
                aria-pressed={active}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

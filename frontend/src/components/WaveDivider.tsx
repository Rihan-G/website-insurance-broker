/**
 * WaveDivider — animated flowing wave between sections
 * ui-ux-pro-max-skill #15: Motion-Driven UI
 */
interface WaveDividerProps {
  topColor?: string;
  bottomColor?: string;
  flip?: boolean;
  height?: number;
}

function heightClass(height: number): string {
  if (height <= 60) return "wave-divider-h-60";
  if (height >= 80) return "wave-divider-h-80";
  return "wave-divider-h-72";
}

export function WaveDivider({
  topColor = "#082F49",
  bottomColor = "#ffffff",
  flip = false,
  height = 72,
}: WaveDividerProps) {
  const hClass = heightClass(height);
  const h = height;

  return (
    <div className={`relative w-full overflow-hidden ${hClass} ${flip ? "wave-divider-flip" : ""}`}>
      <svg
        className="absolute bottom-0 h-full w-[200%]"
        viewBox={`0 0 2880 ${h}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          className="wave-flow-slow"
          d={`M0,${h * 0.5} C240,${h * 0.85} 480,${h * 0.15} 720,${h * 0.5} C960,${h * 0.85} 1200,${h * 0.15} 1440,${h * 0.5} C1680,${h * 0.85} 1920,${h * 0.15} 2160,${h * 0.5} C2400,${h * 0.85} 2640,${h * 0.15} 2880,${h * 0.5} L2880,${h} L0,${h} Z`}
          fill={topColor}
          opacity="0.4"
        />
        <path
          className="wave-flow"
          d={`M0,${h * 0.65} C360,${h * 0.9} 720,${h * 0.35} 1080,${h * 0.65} C1440,${h * 0.9} 1800,${h * 0.35} 2160,${h * 0.65} C2520,${h * 0.9} 2880,${h * 0.35} 3240,${h * 0.65} L3240,${h} L0,${h} Z`}
          fill={topColor}
          opacity="0.7"
        />
        <path
          className="wave-flow-reverse"
          d={`M0,${h * 0.75} C480,${h * 0.95} 960,${h * 0.5} 1440,${h * 0.75} C1920,${h * 0.95} 2400,${h * 0.5} 2880,${h * 0.75} C3360,${h * 0.95} 3840,${h * 0.5} 4320,${h * 0.75} L4320,${h} L0,${h} Z`}
          fill={topColor}
        />
        <rect x="0" y={h - 1} width="2880" height="1" fill={bottomColor} />
      </svg>
    </div>
  );
}

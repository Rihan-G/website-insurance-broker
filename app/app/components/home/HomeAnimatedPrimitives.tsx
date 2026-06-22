import { useInView } from "~/hooks/useInView";
import { useCounter } from "~/hooks/useCounter";

export function AnimatedSection({
  children,
  className = "",
  animation = "animate-on-scroll",
}: {
  children: React.ReactNode;
  className?: string;
  animation?: string;
}) {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={`${animation} ${isInView ? "in-view" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, isInView } = useInView();
  const count = useCounter(value, isInView);
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-bold text-white md:text-5xl">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-2 text-sm text-blue-200 font-medium">{label}</p>
    </div>
  );
}

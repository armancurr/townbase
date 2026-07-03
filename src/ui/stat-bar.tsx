interface StatBarProps {
  label: string;
  value: number;
  tone: "green" | "blue" | "amber" | "red" | "slate";
}

const toneClass = {
  green: "bg-emerald-400",
  blue: "bg-sky-400",
  amber: "bg-amber-400",
  red: "bg-rose-400",
  slate: "bg-slate-300",
};

export function StatBar({ label, value, tone }: StatBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-300">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-slate-800">
        <div
          className={`h-full ${toneClass[tone]} transition-all duration-300`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

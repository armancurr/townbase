interface ResourceCounterProps {
  label: string;
  value: number | string;
}

export function ResourceCounter({ label, value }: ResourceCounterProps) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900/75 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-50">{value}</div>
    </div>
  );
}

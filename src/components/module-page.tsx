import type { LucideIcon } from "lucide-react";

type Metric = {
  label: string;
  value: string;
  hint: string;
};

export function ModulePage({
  title,
  description,
  icon: Icon,
  metrics,
  actions
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  metrics: Metric[];
  actions: string[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-ink">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-line bg-white p-5">
            <div className="text-sm text-muted">{metric.label}</div>
            <div className="mt-3 text-2xl font-semibold text-ink">{metric.value}</div>
            <div className="mt-2 text-xs text-muted">{metric.hint}</div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-semibold text-ink">待建设能力</h2>
        </div>
        <div className="divide-y divide-line">
          {actions.map((action) => (
            <div key={action} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-ink">{action}</span>
              <span className="rounded-md bg-[#F2F4F7] px-2 py-1 text-xs text-muted">规划中</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

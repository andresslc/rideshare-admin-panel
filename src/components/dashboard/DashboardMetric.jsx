import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Info } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatMetric, metricNumber } from "../../utils/dashboardMetrics";

export function ResourceStatus({ resource, label = "Source" }) {
  const { loading, data, error, updatedAt, refresh } = resource;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
      <span className={error ? "text-amber-700 dark:text-amber-400" : ""}>
        {error ? (data !== null ? "Stale · refresh failed" : "Unavailable") : loading && data === null ? "Loading…" : loading ? "Refreshing…" : "Updated"}
        {updatedAt && <> · <time dateTime={updatedAt.toISOString()} title={updatedAt.toISOString()}>{updatedAt.toLocaleTimeString()}</time></>}
      </span>
      {error && <><span title={error}>{label}: {error}</span><Button variant="ghost" size="sm" onClick={refresh}>Retry</Button></>}
    </div>
  );
}

const tones = {
  blue: { icon: "bg-blue-100 dark:bg-blue-900/40", value: "text-blue-600 dark:text-blue-400" },
  cyan: { icon: "bg-cyan-100 dark:bg-cyan-900/40", value: "text-cyan-700 dark:text-cyan-400" },
  emerald: { icon: "bg-emerald-100 dark:bg-emerald-900/40", value: "text-emerald-600 dark:text-emerald-400" },
  violet: { icon: "bg-violet-100 dark:bg-violet-900/40", value: "text-violet-600 dark:text-violet-400" },
  amber: { icon: "bg-yellow-100 dark:bg-yellow-900/40", value: "text-yellow-700 dark:text-yellow-400" },
};

export default function DashboardMetric({ title, value, resource, description, icon: Icon, href, money = false, tone = "blue", note, children }) {
  const missing = money ? value === "—" : metricNumber(value) === null;
  const colors = tones[tone] || tones.blue;
  return (
    <Card className="relative min-w-0 min-h-[122px] flex flex-col" padding="px-6 py-5" aria-label={title} title={resource.updatedAt ? "Updated " + resource.updatedAt.toLocaleString() : undefined}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
          <p className={"text-2xl font-bold tracking-tight tabular-nums break-words mt-1 " + colors.value}>
            {resource.loading && resource.data === null ? "…" : money ? value : formatMetric(value)}
          </p>
          {note && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{note}</p>}
        </div>
        {Icon && <span className={"rounded-lg p-3 shrink-0 " + colors.icon + " " + colors.value}><Icon aria-hidden="true" className="w-5 h-5" /></span>}
      </div>
      {missing && resource.data !== null && <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">Value unavailable</p>}
      {(resource.error || resource.loading && resource.data === null) && <div className="mt-2"><ResourceStatus resource={resource} label={title} /></div>}
      <details className="group text-xs text-gray-600 dark:text-gray-300">
        <summary title="Metric definition" className="absolute top-1.5 right-1.5 flex items-center gap-0.5 cursor-pointer list-none rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Info aria-hidden="true" className="w-3 h-3" /><span className="sr-only">Metric definition</span><ChevronDown aria-hidden="true" className="w-2.5 h-2.5 group-open:rotate-180" />
        </summary>
        <div className="mt-2 leading-5"><p>{description}</p>{children && <div className="mt-2">{children}</div>}{!resource.error && !(resource.loading && resource.data === null) && <div className="mt-2"><ResourceStatus resource={resource} label={title} /></div>}</div>
      </details>
      {href && <Link aria-label="View details" title="View details" className={"absolute bottom-1.5 right-1.5 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 " + colors.value} to={href}><ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" /></Link>}
    </Card>
  );
}

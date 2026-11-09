import { useState } from "react";
import { BarChart3, Table2, Car, Users, TrendingUp } from "lucide-react";
import Card from "../ui/Card";
import { ResourceStatus } from "./DashboardMetric";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatMetric, getRegistrationProjection, metricCount } from "../../utils/dashboardMetrics";

const categoryColors = { private: "#9ca3af", economy: "#20b981", luxury: "#6366f1", carpool: "#f59e0b" };
const head = "px-3 py-3 text-left font-medium text-gray-500 dark:text-gray-400";
const cell = "px-3 py-3 text-gray-900 dark:text-gray-200 tabular-nums";

function ViewSwitch({ view, onChange, label }) {
  return <div role="group" aria-label={label} className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
    {[["chart", "Chart", BarChart3], ["table", "Table", Table2]].map(([value, title, Icon]) => <button key={value} type="button" aria-pressed={view === value} onClick={() => onChange(value)} className={"inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 " + (view === value ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white")}>
      <Icon aria-hidden="true" className="w-3.5 h-3.5" />{title}
    </button>)}
  </div>;
}

function CountTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs shadow-lg" role="status">
    <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
    {payload.map((entry) => <p key={entry.dataKey} className="flex gap-4 justify-between text-gray-600 dark:text-gray-300"><span>{entry.name}</span><strong className="text-gray-900 dark:text-white tabular-nums">{formatMetric(entry.value)}</strong></p>)}
  </div>;
}

export function RideCategoryChart({ distribution, total }) {
  const [view, setView] = useState("chart");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const rows = distribution?.map((row) => ({ category: row.type, count: metricCount(row.count), color: categoryColors[row.type.toLowerCase()] || "#64748b" }));
  const current = rows?.find((row) => row.category === (hovered ?? selected));
  const maximum = rows?.length ? Math.max(...rows.map((row) => row.count)) : 0;
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><TrendingUp aria-hidden="true" className="w-5 h-5 text-violet-500" />Ride Type Distribution</h3>
      <ViewSwitch view={view} onChange={setView} label="Category display" />
    </div>
    {!rows ? <p className="text-sm text-gray-500 dark:text-gray-400">Category data unavailable.</p> : rows.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No recorded categories returned.</p> : view === "table" ? <div className="overflow-x-auto">
      <table className="w-full text-sm"><caption className="sr-only">Recorded category counts</caption><thead><tr><th className={head}>Category</th><th className={head}>Records</th></tr></thead><tbody>
        {rows.map((row, index) => <tr key={row.category + index} className="border-t border-gray-100 dark:border-gray-700"><th className={cell + " text-left font-medium"}><span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: row.color }} aria-hidden="true" />{row.category}</th><td className={cell}>{formatMetric(row.count)}</td></tr>)}
      </tbody></table>
    </div> : <div aria-label="Recorded category count chart" className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke={current?.color || "#10b981"} strokeWidth="12" /></svg>
        <div role="status" aria-live="polite" className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <strong className="text-xl font-bold text-gray-900 dark:text-white tabular-nums break-all">{formatMetric(current ? current.count : total)}</strong>
          <span className="text-[10px] leading-3 text-gray-500 dark:text-gray-400 mt-1 break-words">{current ? current.category : "Total records"}</span>
        </div>
      </div>
      <div className="min-w-0 w-full flex-1 space-y-2">
        {rows.map((row, index) => <button key={row.category + index} type="button" aria-label={row.category + ": " + formatMetric(row.count) + " records"} aria-pressed={selected === row.category} onMouseEnter={() => setHovered(row.category)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(row.category)} onBlur={() => setHovered(null)} onClick={() => setSelected(selected === row.category ? null : row.category)} title={row.category + ": " + formatMetric(row.count) + " independently reported records"} className={"block w-full min-w-0 text-left rounded px-1.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 " + (current?.category === row.category ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-700/50")}>
          <span className="flex items-center justify-between gap-3 text-xs mb-1">
            <span className="inline-flex min-w-0 items-center gap-1.5 text-gray-600 dark:text-gray-300"><span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} aria-hidden="true" /><span className="break-words">{row.category}</span></span>
            <strong className="text-gray-900 dark:text-gray-100 tabular-nums">{formatMetric(row.count)}</strong>
          </span>
          <span className="block h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden" aria-hidden="true"><span className="block h-full rounded-full" style={{ width: (maximum > 0 ? row.count / maximum * 100 : 0) + "%", backgroundColor: row.color }} /></span>
        </button>)}
      </div>
      <p className="sr-only">The circle displays a count. Bars compare independently reported categories on a shared scale; categories may overlap.</p>
    </div>}
  </div>;
}

export function RegistrationPanel({ label, registrations, resource }) {
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState("chart");
  const rider = label === "Riders";
  const Icon = rider ? Users : Car;
  const color = rider ? "text-blue-600 dark:text-blue-400" : "text-violet-600 dark:text-violet-400";
  const surface = rider ? "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900" : "bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-900";
  const fill = rider ? "#2563eb" : "#7c3aed";
  const pace = getRegistrationProjection(registrations);
  const rows = [
    { window: "Last 7 days", count: metricCount(registrations?.last7Days) },
    { window: "Last 30 days", count: metricCount(registrations?.last30Days) },
  ];
  const complete = rows.every((row) => row.count !== null);
  return <Card padding="p-5 sm:p-6 xl:px-11 xl:py-10" className="relative min-w-0" aria-label={label + " registration growth"} title={resource.updatedAt ? "Registrations updated " + resource.updatedAt.toLocaleString() : undefined}>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Icon aria-hidden="true" className={"w-5 h-5 " + color} />{rider ? "New rider registrations" : "New driver registrations"}</h3>
      <button type="button" aria-pressed={expanded} onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><BarChart3 aria-hidden="true" className="w-3.5 h-3.5" />{expanded ? "Show totals" : "Show chart"}</button>
    </div>
    {!expanded ? <div className="grid grid-cols-2 gap-3">
      {rows.map((row) => <div key={row.window} className={"rounded-xl border p-4 text-center " + surface}>
        <p className="text-2xl font-bold tabular-nums break-words text-gray-900 dark:text-gray-100">{resource.loading && resource.data === null ? "…" : formatMetric(row.count)}</p>
        <p className={"text-xs font-medium mt-1 " + color}>{row.window}</p>
      </div>)}
    </div> : <div>
      <div className="flex justify-end mb-3"><ViewSwitch view={view} onChange={setView} label={label + " registration display"} /></div>
      {view === "table" || !complete ? <div className="overflow-x-auto">
        <table className="w-full text-sm"><caption className="sr-only">Observed {label.toLowerCase()} registrations</caption><thead><tr><th className={head}>Accounts</th>{rows.map((row) => <th key={row.window} className={head}>{row.window}</th>)}</tr></thead><tbody><tr className="border-t border-gray-100 dark:border-gray-700"><th className={cell + " text-left font-medium"}>{label}</th>{rows.map((row) => <td key={row.window} className={cell}>{formatMetric(row.count)}</td>)}</tr></tbody></table>
        {!complete && <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">Some registration counts are unavailable.</p>}
      </div> : <div aria-label={label + " observed registration chart"}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
            <XAxis dataKey="window" className="text-gray-600 dark:text-gray-400" tick={{ fill: "currentColor", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} className="text-gray-600 dark:text-gray-400" tick={{ fill: "currentColor", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CountTooltip />} cursor={{ fill: "currentColor", className: "text-gray-100 dark:text-gray-700" }} />
            <Bar dataKey="count" name={label} fill={fill} maxBarSize={60} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </div>}
    <p className="sr-only">Observed rolling windows · deleted accounts excluded</p>
    <details className="text-xs text-gray-500 dark:text-gray-400">
      <summary title="30-day scenarios" className="absolute bottom-2 right-3 cursor-pointer rounded p-1 list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><TrendingUp aria-hidden="true" className="w-3.5 h-3.5" /><span className="sr-only">30-day scenarios</span></summary>
      <p className="mt-2 leading-5">Additional registrations in the next 30 days at each observed pace. Rounded to whole people; estimates, not validated forecasts.</p>
      <div className="grid grid-cols-2 gap-3 mt-3">
        {[["At 7-day pace", pace.recentPace], ["At 30-day pace", pace.monthlyPace]].map(([title, count]) => <div key={title} className={"border rounded-lg p-3 text-center " + surface}><p className="text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums break-words">{formatMetric(count)}</p><p className={"text-xs mt-1 " + color}>{title}</p></div>)}
      </div>
      {!resource.error && <div className="mt-3"><ResourceStatus resource={resource} label={label + " registrations"} /></div>}
    </details>
    {resource.error && <div className="mt-3"><ResourceStatus resource={resource} label={label + " registrations"} /></div>}
  </Card>;
}

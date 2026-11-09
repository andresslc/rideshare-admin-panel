import { useCallback, useEffect, useRef, useState } from "react";
import { createDashboardResource, emptyResource } from "../../utils/dashboardResource";

export default function useDashboardResource(fetcher, { interval = 60_000, enabled = true, identity = "default" } = {}) {
  const [state, setState] = useState(() => ({ ...emptyResource(enabled), fetcher, identity }));
  const active = useRef(null);

  useEffect(() => {
    setState({ ...emptyResource(enabled), fetcher, identity });
    if (!enabled) return;
    // Fresh on EVERY setup, including Strict Mode's cleanup/setup cycle.
    const runner = createDashboardResource(fetcher, (next) => setState({ ...next, fetcher, identity }));
    active.current = runner;
    runner.refresh();
    const tick = () => { if (!document.hidden) runner.refresh({ automatic: true }); };
    const timer = interval > 0 ? setInterval(tick, interval) : null;
    // Unpolled sources refresh only on demand, so returning to the tab keeps
    // results derived from them, such as driver requirement checks.
    if (timer) document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      runner.dispose();
      if (active.current === runner) active.current = null;
    };
  }, [fetcher, interval, enabled, identity]);

  const refresh = useCallback(() => active.current?.refresh(), []);
  // Hide obsolete role/period data before effect cleanup runs.
  const current = enabled && state.fetcher === fetcher && state.identity === identity;
  return { ...(current ? state : emptyResource(enabled)), refresh };
}

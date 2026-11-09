export const emptyResource = (enabled = true) => ({ data: null, loading: enabled, error: null, updatedAt: null });

// Automatic refreshes skip a pending request; manual refresh replaces it.
// Failures preserve the last successful data and timestamp.
export function createDashboardResource(fetcher, onState, now = () => new Date()) {
  let state = emptyResource();
  let active = null;
  let sequence = 0;
  let disposed = false;
  const publish = (next) => { state = next; onState(state); };
  const refresh = async ({ automatic = false } = {}) => {
    if (disposed || (automatic && active)) return;
    active?.abort();
    const controller = new AbortController();
    active = controller;
    const request = ++sequence;
    const isCurrent = () => !disposed && !controller.signal.aborted && request === sequence;
    publish({ ...state, loading: true });
    try {
      const data = await fetcher(controller.signal);
      if (!isCurrent()) return;
      if (data == null) throw new Error("No data returned");
      publish({ data, loading: false, error: null, updatedAt: now() });
    } catch (error) {
      if (isCurrent()) publish({ ...state, loading: false, error: error.message || "Update failed" });
    } finally {
      if (request === sequence) active = null;
    }
  };
  return {
    refresh,
    dispose() { disposed = true; sequence += 1; active?.abort(); active = null; },
  };
}
